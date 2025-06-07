"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runInferenceServer = runInferenceServer;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const ethers_1 = require("ethers");
const sdk_1 = require("../sdk");
const const_1 = require("../cli/const");
const cache_1 = require("../sdk/common/storage/cache");
async function runInferenceServer(options) {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const cache = new cache_1.Cache();
    let broker;
    let providerAddress;
    let endpoint;
    let model;
    async function initBroker() {
        const provider = new ethers_1.ethers.JsonRpcProvider(options.rpc || process.env.RPC_ENDPOINT || const_1.ZG_RPC_ENDPOINT_TESTNET);
        const privateKey = options.key || process.env.ZG_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('Missing wallet private key, please provide --key or set ZG_PRIVATE_KEY in environment variables');
        }
        console.log('Initializing broker...');
        broker = await (0, sdk_1.createZGComputeNetworkBroker)(new ethers_1.ethers.Wallet(privateKey, provider), options.ledgerCa, options.inferenceCa, undefined, options.gasPrice ? Number(options.gasPrice) : undefined);
        providerAddress = options.provider;
        await broker.inference.acknowledgeProviderSigner(providerAddress);
        const meta = await broker.inference.getServiceMetadata(providerAddress);
        endpoint = meta.endpoint;
        model = meta.model;
    }
    async function chatProxy(body, stream = false) {
        const headers = await broker.inference.getRequestHeaders(providerAddress, Array.isArray(body.messages) && body.messages.length > 0
            ? body.messages.map((m) => m.content).join('\n')
            : '');
        body.model = model;
        if (stream) {
            body.stream = true;
        }
        const response = await fetch(`${endpoint}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers,
            },
            body: JSON.stringify(body),
        });
        return response;
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
            const result = await chatProxy(body, stream);
            if (stream) {
                res.setHeader('Content-Type', 'text/event-stream');
                res.setHeader('Cache-Control', 'no-cache');
                res.setHeader('Connection', 'keep-alive');
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
                    // Cache the complete content
                    if (id) {
                        cache.setItem(id, completeContent, 1 * 10 * 1000, cache_1.CacheValueTypeEnum.Other);
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
                const key = data.id;
                const value = data.choices?.[0]?.message?.content;
                cache.setItem(key, value, 5 * 60 * 1000, cache_1.CacheValueTypeEnum.Other);
                res.json(data);
            }
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    app.post('/v1/verify', async (req, res) => {
        const { id } = req.body;
        if (!id) {
            res.status(400).json({ error: 'Missing id in request body' });
            return;
        }
        const completeContent = cache.getItem(id);
        if (!completeContent) {
            res.status(404).json({ error: 'No cached content for this id' });
            return;
        }
        try {
            const isValid = await broker.inference.processResponse(providerAddress, completeContent, id);
            res.json({ isValid });
        }
        catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    await initBroker();
    const port = options.port ? Number(options.port) : 3000;
    const host = options.host || '0.0.0.0';
    app.listen(port, host, async () => {
        try {
            const fetch = (await Promise.resolve().then(() => tslib_1.__importStar(require('node-fetch')))).default;
            const res = await fetch(`http://${host}:${port}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages: [{ role: 'system', content: 'health check' }],
                }),
            });
            if (res.ok) {
                console.log(`Health check passed\nInference service is running on ${host}:${port}`);
            }
            else {
                const errText = await res.text();
                console.error('Health check failed:', res.status, errText);
            }
        }
        catch (e) {
            console.error('Health check error:', e);
        }
    });
}
//# sourceMappingURL=inference-server.js.map