"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderLoadBalancer = void 0;
const strategies_1 = require("./strategies");
const health_checker_1 = require("./health-checker");
const session_manager_1 = require("./session-manager");
const broker_1 = require("../broker");
class ProviderLoadBalancer {
    providers = new Map();
    strategy;
    healthChecker;
    sessionManager;
    maxRetries;
    signer;
    ledgerCA;
    inferenceCA;
    fineTuningCA;
    gasPrice;
    constructor(signer, options, ledgerCA, inferenceCA, fineTuningCA, gasPrice) {
        this.signer = signer;
        this.strategy = (0, strategies_1.createLoadBalancingStrategy)(options.strategy);
        this.maxRetries = options.maxRetries;
        this.sessionManager = new session_manager_1.SessionManager(options.sessionTimeout);
        this.ledgerCA = ledgerCA;
        this.inferenceCA = inferenceCA;
        this.fineTuningCA = fineTuningCA;
        this.gasPrice = gasPrice;
        this.initializeProviders(options.providers);
        this.healthChecker = new health_checker_1.HealthChecker(this.providers, options.healthCheckInterval);
    }
    initializeProviders(providerAddresses) {
        for (const address of providerAddresses) {
            const provider = {
                address,
                endpoint: '',
                model: '',
                isHealthy: false,
                connections: 0,
                weight: 1,
                lastHealthCheck: 0,
                broker: null
            };
            this.providers.set(address, provider);
        }
    }
    async initialize() {
        console.log('Initializing providers...');
        for (const [address, provider] of this.providers.entries()) {
            try {
                console.log(`Initializing provider: ${address}`);
                const broker = await (0, broker_1.createZGComputeNetworkBroker)(this.signer, this.ledgerCA, this.inferenceCA, this.fineTuningCA, this.gasPrice);
                await broker.inference.acknowledgeProviderSigner(address);
                const meta = await broker.inference.getServiceMetadata(address);
                provider.broker = broker;
                provider.endpoint = meta.endpoint;
                provider.model = meta.model;
                provider.isHealthy = true;
                provider.lastHealthCheck = Date.now();
                console.log(`Provider ${address} initialized successfully`);
            }
            catch (error) {
                console.error(`Failed to initialize provider ${address}:`, error);
                provider.isHealthy = false;
            }
        }
        this.healthChecker.start();
        console.log('Load balancer initialization completed');
    }
    selectProvider(sessionId) {
        const healthyProviders = this.getHealthyProviders();
        if (healthyProviders.length === 0) {
            throw new Error('No healthy providers available');
        }
        return this.strategy.selectProvider(healthyProviders);
    }
    assignProviderForRequest(requestId, sessionId) {
        let provider = null;
        if (sessionId) {
            const sessionProvider = this.sessionManager.getProviderForRequest(requestId);
            if (sessionProvider) {
                provider = this.providers.get(sessionProvider) || null;
            }
        }
        if (!provider) {
            provider = this.selectProvider(sessionId);
            if (!provider) {
                throw new Error('No available providers');
            }
        }
        const { sessionId: finalSessionId } = this.sessionManager.assignProvider(requestId, provider.address, sessionId);
        provider.connections++;
        return { sessionId: finalSessionId, provider };
    }
    getProviderForRequest(requestId) {
        const providerAddress = this.sessionManager.getProviderForRequest(requestId);
        return providerAddress ? this.providers.get(providerAddress) || null : null;
    }
    releaseProvider(requestId) {
        const provider = this.getProviderForRequest(requestId);
        if (provider && provider.connections > 0) {
            provider.connections--;
        }
    }
    getHealthyProviders() {
        return Array.from(this.providers.values()).filter(p => p.isHealthy);
    }
    getAllProviders() {
        return Array.from(this.providers.values());
    }
    getProviderStats() {
        const stats = {
            totalProviders: this.providers.size,
            healthyProviders: this.getHealthyProviders().length,
            totalConnections: Array.from(this.providers.values()).reduce((sum, p) => sum + p.connections, 0),
            activeSessions: this.sessionManager.getSessionCount(),
            providers: Array.from(this.providers.entries()).map(([address, provider]) => ({
                address,
                endpoint: provider.endpoint,
                model: provider.model,
                isHealthy: provider.isHealthy,
                connections: provider.connections,
                lastHealthCheck: provider.lastHealthCheck
            }))
        };
        return stats;
    }
    async retryWithDifferentProvider(operation, excludeProviders = new Set(), requestId) {
        let lastError = null;
        let attempts = 0;
        while (attempts < this.maxRetries) {
            try {
                const availableProviders = this.getHealthyProviders().filter(p => !excludeProviders.has(p.address));
                if (availableProviders.length === 0) {
                    throw new Error('No available providers for retry');
                }
                const provider = this.strategy.selectProvider(availableProviders);
                if (!provider) {
                    throw new Error('Load balancer returned no provider');
                }
                return await operation(provider);
            }
            catch (error) {
                lastError = error;
                attempts++;
                const failedProvider = this.getHealthyProviders().find(p => !excludeProviders.has(p.address));
                if (failedProvider) {
                    excludeProviders.add(failedProvider.address);
                    failedProvider.isHealthy = false;
                }
                console.warn(`Retry attempt ${attempts} failed:`, error);
            }
        }
        throw new Error(`All retry attempts failed. Last error: ${lastError?.message}`);
    }
    destroy() {
        this.healthChecker.stop();
    }
}
exports.ProviderLoadBalancer = ProviderLoadBalancer;
//# sourceMappingURL=load-balancer.js.map