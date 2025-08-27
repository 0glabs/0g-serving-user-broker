"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runRouterServer = runRouterServer;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const ethers_1 = require("ethers");
const http_1 = require("http");
const sdk_1 = require("../sdk");
const const_1 = require("../cli/const");
const cache_1 = require("../sdk/common/storage/cache");
const cache_keys_1 = require("../sdk/common/storage/cache-keys");
async function runRouterServer(options) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const cache = new cache_1.Cache();
    let broker;
    const providers = new Map();
    const ERROR_RECOVERY_TIME = 60000; // 1 minute
    async function initBroker() {
        const provider = new ethers_1.ethers.JsonRpcProvider(options.rpc || process.env.RPC_ENDPOINT || const_1.ZG_RPC_ENDPOINT_TESTNET);
        const privateKey = options.key || process.env.ZG_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('Missing wallet private key, please provide --key or set ZG_PRIVATE_KEY in environment variables');
        }
        console.log('Initializing broker...');
        broker = await (0, sdk_1.createZGComputeNetworkBroker)(new ethers_1.ethers.Wallet(privateKey, provider), options.ledgerCa, options.inferenceCa, undefined, options.gasPrice ? Number(options.gasPrice) : undefined);
        // Initialize all providers
        console.log(`Initializing ${options.providers.length} providers...`);
        for (const providerAddress of options.providers) {
            try {
                console.log(`Acknowledging provider: ${providerAddress}`);
                await broker.inference.acknowledgeProviderSigner(providerAddress);
                const meta = await broker.inference.getServiceMetadata(providerAddress);
                providers.set(providerAddress, {
                    address: providerAddress,
                    endpoint: meta.endpoint,
                    model: meta.model,
                    available: true,
                });
                console.log(`✓ Provider ${providerAddress} initialized successfully`);
            }
            catch (error) {
                console.error(`✗ Failed to initialize provider ${providerAddress}: ${error.message}`);
                providers.set(providerAddress, {
                    address: providerAddress,
                    endpoint: '',
                    model: '',
                    available: false,
                    lastError: error.message,
                    lastErrorTime: Date.now(),
                });
            }
        }
        const availableProviders = Array.from(providers.values()).filter(p => p.available);
        if (availableProviders.length === 0) {
            throw new Error('No available providers after initialization');
        }
        console.log(`Successfully initialized ${availableProviders.length}/${options.providers.length} providers`);
    }
    function getAvailableProvider() {
        const now = Date.now();
        // First, try to recover any providers that have been down for a while
        for (const provider of providers.values()) {
            if (!provider.available && provider.lastErrorTime) {
                if (now - provider.lastErrorTime > ERROR_RECOVERY_TIME) {
                    provider.available = true;
                    console.log(`Provider ${provider.address} marked as available for retry`);
                }
            }
        }
        // Get all available providers
        const availableProviders = Array.from(providers.values()).filter(p => p.available);
        if (availableProviders.length === 0) {
            // If no providers are available, reset all and try again
            console.log('No available providers, resetting all providers for retry');
            for (const provider of providers.values()) {
                provider.available = true;
            }
            return Array.from(providers.values())[0] || null;
        }
        // Simple round-robin selection
        return availableProviders[Math.floor(Math.random() * availableProviders.length)];
    }
    function markProviderUnavailable(providerAddress, error) {
        const provider = providers.get(providerAddress);
        if (provider) {
            provider.available = false;
            provider.lastError = error;
            provider.lastErrorTime = Date.now();
            console.error(`Provider ${providerAddress} marked as unavailable: ${error}`);
        }
    }
    async function chatProxyWithFallback(body, stream = false, attemptedProviders = new Set()) {
        const provider = getAvailableProvider();
        if (!provider) {
            throw new Error('No available providers');
        }
        if (attemptedProviders.has(provider.address)) {
            // Avoid infinite loop by not retrying the same provider
            const remainingProviders = Array.from(providers.values()).filter(p => !attemptedProviders.has(p.address) && p.available);
            if (remainingProviders.length === 0) {
                throw new Error('All providers have been attempted and failed');
            }
            return chatProxyWithFallback(body, stream, attemptedProviders);
        }
        attemptedProviders.add(provider.address);
        try {
            console.log(`Using provider: ${provider.address}`);
            const headers = await broker.inference.getRequestHeaders(provider.address, Array.isArray(body.messages) && body.messages.length > 0
                ? body.messages.map((m) => m.content).join('\n')
                : '');
            body.model = provider.model;
            if (stream) {
                body.stream = true;
            }
            const response = await fetch(`${provider.endpoint}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error(`Provider returned status ${response.status}`);
            }
            return { response, provider: provider.address };
        }
        catch (error) {
            console.error(`Provider ${provider.address} failed: ${error.message}`);
            markProviderUnavailable(provider.address, error.message);
            // Try with another provider
            const remainingAvailableProviders = Array.from(providers.values()).filter(p => p.available && !attemptedProviders.has(p.address));
            if (remainingAvailableProviders.length > 0) {
                console.log(`Retrying with another provider (${remainingAvailableProviders.length} remaining)`);
                return chatProxyWithFallback(body, stream, attemptedProviders);
            }
            throw new Error(`All providers failed. Last error: ${error.message}`);
        }
    }
    app.post('/v1/chat/completions', async (req, res) => {
        const body = req.body;
        const stream = body.stream === true;
        if (!Array.isArray(body.messages) || body.messages.length === 0) {
            res.status(400).json({
                error: 'Missing or invalid messages in request body',
            });
            return;
        }
        try {
            const { response: result, provider: usedProvider } = await chatProxyWithFallback(body, stream);
            if (stream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
                res.setHeader('X-Provider-Address', usedProvider);
                if (result.body) {
                    let rawBody = '';
                    const decoder = new TextDecoder();
                    const reader = result.body.getReader();
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done)
                            break;
                        res.write(value);
                        rawBody += decoder.decode(value, {
                            stream: true,
                        });
                    }
                    res.end();
                    // Parse rawBody and cache it after the stream ends
                    let completeContent = '';
                    let id;
                    for (const line of rawBody.split('\n')) {
                        const trimmed = line.trim();
                        if (!trimmed)
                            continue;
                        const jsonStr = trimmed.startsWith('data:')
                            ? trimmed.slice(5).trim()
                            : trimmed;
                        if (jsonStr === '[DONE]')
                            continue;
                        try {
                            const message = JSON.parse(jsonStr);
                            if (!id && message.id)
                                id = message.id;
                            const receivedContent = message.choices?.[0]?.delta?.content;
                            if (receivedContent) {
                                completeContent += receivedContent;
                            }
                        }
                        catch (e) { }
                    }
                    // Cache the complete content with provider info
                    if (id) {
                        cache.setItem(cache_keys_1.CacheKeyHelpers.getContentKey(id), { content: completeContent, provider: usedProvider }, 1 * 10 * 1000, cache_1.CacheValueTypeEnum.Other);
                    }
                }
                else {
                    res.status(500).json({
                        error: 'No stream body from remote server',
                    });
                }
            }
            else {
                const data = await result.json();
                data['x-provider-address'] = usedProvider;
                const key = data.id;
                const value = data.choices?.[0]?.message?.content;
                cache.setItem(cache_keys_1.CacheKeyHelpers.getContentKey(key), { content: value, provider: usedProvider }, 5 * 60 * 1000, cache_1.CacheValueTypeEnum.Other);
                res.json(data);
            }
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.get('/v1/providers/status', async (req, res) => {
        const status = Array.from(providers.values()).map(p => ({
            address: p.address,
            endpoint: p.endpoint,
            model: p.model,
            available: p.available,
            lastError: p.lastError,
            lastErrorTime: p.lastErrorTime,
        }));
        res.json({ providers: status });
    });
    const port = options.port ? Number(options.port) : 3000;
    const host = options.host || '0.0.0.0';
    // Check if port is already in use BEFORE initializing broker to save time
    const checkPort = async (port, host) => {
        return new Promise((resolve) => {
            const testServer = (0, http_1.createServer)();
            testServer.listen(port, host, () => {
                testServer.close(() => resolve(true)); // Port is available
            });
            testServer.on('error', (err) => {
                if (err.code === 'EADDRINUSE') {
                    resolve(false); // Port is in use
                }
                else {
                    resolve(false); // Other error, treat as unavailable
                }
            });
        });
    };
    const isPortAvailable = await checkPort(port, host);
    if (!isPortAvailable) {
        console.error(`\nError: Port ${port} is already in use.`);
        console.error(`Please try one of the following:`);
        console.error(`  1. Use a different port: --port <PORT>`);
        console.error(`  2. Stop the process using port ${port}`);
        console.error(`  3. Find the process: lsof -i :${port} or ss -tlnp | grep :${port}\n`);
        process.exit(1);
    }
    await initBroker();
    const server = app.listen(port, host, async () => {
        console.log(`\nRouter service is running on ${host}:${port}`);
        console.log(`Available endpoints:`);
        console.log(`  - POST /v1/chat/completions - Chat completions with automatic failover`);
        console.log(`  - GET  /v1/providers/status - Check status of all providers`);
        console.log(`\nConfigured providers: ${options.providers.length}`);
        // Perform health check
        try {
            const fetch = (await Promise.resolve().then(() => tslib_1.__importStar(require('node-fetch')))).default;
            const healthCheckHost = host === '0.0.0.0' ? 'localhost' : host;
            const res = await fetch(`http://${healthCheckHost}:${port}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'system', content: 'health check' }],
                }),
            });
            if (res.ok) {
                console.log(`\n✓ Health check passed`);
            }
            else {
                const errText = await res.text();
                console.error('\n✗ Health check failed:', res.status, errText);
            }
        }
        catch (e) {
            console.error('\n✗ Health check error:', e);
        }
    });
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.error(`\nError: Port ${port} is already in use.`);
            console.error(`Please try one of the following:`);
            console.error(`  1. Use a different port: --port <PORT>`);
            console.error(`  2. Stop the process using port ${port}`);
            console.error(`  3. Find the process: lsof -i :${port} or netstat -tulpn | grep :${port}\n`);
            process.exit(1);
        }
        else {
            console.error('Server error:', err);
            process.exit(1);
        }
    });
}
//# sourceMappingURL=router-server.js.map