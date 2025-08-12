import type { ProviderInfo, LoadBalancingStrategy } from './types'

export interface LoadBalancingStrategyInterface {
    selectProvider(providers: ProviderInfo[]): ProviderInfo | null
}

export class RoundRobinStrategy implements LoadBalancingStrategyInterface {
    private currentIndex = 0

    selectProvider(providers: ProviderInfo[]): ProviderInfo | null {
        const healthyProviders = providers.filter(p => p.isHealthy)
        if (healthyProviders.length === 0) {
            return null
        }

        const provider = healthyProviders[this.currentIndex % healthyProviders.length]
        this.currentIndex = (this.currentIndex + 1) % healthyProviders.length
        return provider
    }
}

export class LeastConnectionsStrategy implements LoadBalancingStrategyInterface {
    selectProvider(providers: ProviderInfo[]): ProviderInfo | null {
        const healthyProviders = providers.filter(p => p.isHealthy)
        if (healthyProviders.length === 0) {
            return null
        }

        return healthyProviders.reduce((prev, current) => 
            prev.connections <= current.connections ? prev : current
        )
    }
}

export class WeightedRoundRobinStrategy implements LoadBalancingStrategyInterface {
    private currentWeights: Map<string, number> = new Map()

    selectProvider(providers: ProviderInfo[]): ProviderInfo | null {
        const healthyProviders = providers.filter(p => p.isHealthy)
        if (healthyProviders.length === 0) {
            return null
        }

        let selectedProvider: ProviderInfo | null = null
        let maxCurrentWeight = 0

        for (const provider of healthyProviders) {
            const currentWeight = (this.currentWeights.get(provider.address) || 0) + provider.weight
            this.currentWeights.set(provider.address, currentWeight)

            if (currentWeight > maxCurrentWeight) {
                maxCurrentWeight = currentWeight
                selectedProvider = provider
            }
        }

        if (selectedProvider) {
            const totalWeight = healthyProviders.reduce((sum, p) => sum + p.weight, 0)
            this.currentWeights.set(selectedProvider.address, maxCurrentWeight - totalWeight)
        }

        return selectedProvider
    }
}

export function createLoadBalancingStrategy(strategy: LoadBalancingStrategy): LoadBalancingStrategyInterface {
    switch (strategy) {
        case 'round-robin':
            return new RoundRobinStrategy()
        case 'least-connections':
            return new LeastConnectionsStrategy()
        case 'weighted-round-robin':
            return new WeightedRoundRobinStrategy()
        default:
            throw new Error(`Unknown load balancing strategy: ${strategy}`)
    }
}