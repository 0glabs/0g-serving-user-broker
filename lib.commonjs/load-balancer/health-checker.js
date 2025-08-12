"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthChecker = void 0;
class HealthChecker {
    providers;
    checkInterval;
    intervalId;
    constructor(providers, checkInterval) {
        this.providers = providers;
        this.checkInterval = checkInterval;
    }
    start() {
        this.scheduleHealthCheck();
    }
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = undefined;
        }
    }
    scheduleHealthCheck() {
        this.intervalId = setInterval(async () => {
            for (const [address, provider] of this.providers.entries()) {
                try {
                    const isHealthy = await this.checkProvider(provider);
                    if (isHealthy !== provider.isHealthy) {
                        provider.isHealthy = isHealthy;
                        provider.lastHealthCheck = Date.now();
                        console.log(`Provider ${address} health status changed to: ${isHealthy}`);
                    }
                }
                catch (error) {
                    console.error(`Health check failed for provider ${address}:`, error);
                    this.markProviderUnhealthy(address);
                }
            }
        }, this.checkInterval);
    }
    async checkProvider(provider) {
        try {
            if (!provider.endpoint) {
                return false;
            }
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const response = await fetch(`${provider.endpoint}/models`, {
                method: 'GET',
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            return response.ok;
        }
        catch (error) {
            return false;
        }
    }
    markProviderUnhealthy(providerAddress) {
        const provider = this.providers.get(providerAddress);
        if (provider) {
            provider.isHealthy = false;
            provider.lastHealthCheck = Date.now();
        }
    }
    markProviderHealthy(providerAddress) {
        const provider = this.providers.get(providerAddress);
        if (provider) {
            provider.isHealthy = true;
            provider.lastHealthCheck = Date.now();
        }
    }
    getHealthyProviders() {
        return Array.from(this.providers.values()).filter(p => p.isHealthy);
    }
}
exports.HealthChecker = HealthChecker;
//# sourceMappingURL=health-checker.js.map