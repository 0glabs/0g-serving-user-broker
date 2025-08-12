"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeightedRoundRobinStrategy = exports.LeastConnectionsStrategy = exports.RoundRobinStrategy = void 0;
exports.createLoadBalancingStrategy = createLoadBalancingStrategy;
class RoundRobinStrategy {
    currentIndex = 0;
    selectProvider(providers) {
        const healthyProviders = providers.filter(p => p.isHealthy);
        if (healthyProviders.length === 0) {
            return null;
        }
        const provider = healthyProviders[this.currentIndex % healthyProviders.length];
        this.currentIndex = (this.currentIndex + 1) % healthyProviders.length;
        return provider;
    }
}
exports.RoundRobinStrategy = RoundRobinStrategy;
class LeastConnectionsStrategy {
    selectProvider(providers) {
        const healthyProviders = providers.filter(p => p.isHealthy);
        if (healthyProviders.length === 0) {
            return null;
        }
        return healthyProviders.reduce((prev, current) => prev.connections <= current.connections ? prev : current);
    }
}
exports.LeastConnectionsStrategy = LeastConnectionsStrategy;
class WeightedRoundRobinStrategy {
    currentWeights = new Map();
    selectProvider(providers) {
        const healthyProviders = providers.filter(p => p.isHealthy);
        if (healthyProviders.length === 0) {
            return null;
        }
        let selectedProvider = null;
        let maxCurrentWeight = 0;
        for (const provider of healthyProviders) {
            const currentWeight = (this.currentWeights.get(provider.address) || 0) + provider.weight;
            this.currentWeights.set(provider.address, currentWeight);
            if (currentWeight > maxCurrentWeight) {
                maxCurrentWeight = currentWeight;
                selectedProvider = provider;
            }
        }
        if (selectedProvider) {
            const totalWeight = healthyProviders.reduce((sum, p) => sum + p.weight, 0);
            this.currentWeights.set(selectedProvider.address, maxCurrentWeight - totalWeight);
        }
        return selectedProvider;
    }
}
exports.WeightedRoundRobinStrategy = WeightedRoundRobinStrategy;
function createLoadBalancingStrategy(strategy) {
    switch (strategy) {
        case 'round-robin':
            return new RoundRobinStrategy();
        case 'least-connections':
            return new LeastConnectionsStrategy();
        case 'weighted-round-robin':
            return new WeightedRoundRobinStrategy();
        default:
            throw new Error(`Unknown load balancing strategy: ${strategy}`);
    }
}
//# sourceMappingURL=strategies.js.map