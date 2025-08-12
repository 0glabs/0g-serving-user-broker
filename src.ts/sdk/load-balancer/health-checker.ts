import type { ProviderInfo } from './types'

export class HealthChecker {
    private providers: Map<string, ProviderInfo>
    private checkInterval: number
    private intervalId?: NodeJS.Timeout

    constructor(providers: Map<string, ProviderInfo>, checkInterval: number) {
        this.providers = providers
        this.checkInterval = checkInterval
    }

    start(): void {
        this.scheduleHealthCheck()
    }

    stop(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = undefined
        }
    }

    private scheduleHealthCheck(): void {
        this.intervalId = setInterval(async () => {
            for (const [address, provider] of this.providers.entries()) {
                try {
                    const isHealthy = await this.checkProvider(provider)
                    if (isHealthy !== provider.isHealthy) {
                        provider.isHealthy = isHealthy
                        provider.lastHealthCheck = Date.now()
                        console.log(`Provider ${address} health status changed to: ${isHealthy}`)
                    }
                } catch (error) {
                    console.error(`Health check failed for provider ${address}:`, error)
                    this.markProviderUnhealthy(address)
                }
            }
        }, this.checkInterval)
    }

    private async checkProvider(provider: ProviderInfo): Promise<boolean> {
        try {
            if (!provider.endpoint) {
                return false
            }

            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 5000)
            
            const response = await fetch(`${provider.endpoint}/models`, {
                method: 'GET',
                signal: controller.signal,
            })
            
            clearTimeout(timeoutId)

            return response.ok
        } catch (error) {
            return false
        }
    }

    private markProviderUnhealthy(providerAddress: string): void {
        const provider = this.providers.get(providerAddress)
        if (provider) {
            provider.isHealthy = false
            provider.lastHealthCheck = Date.now()
        }
    }

    markProviderHealthy(providerAddress: string): void {
        const provider = this.providers.get(providerAddress)
        if (provider) {
            provider.isHealthy = true
            provider.lastHealthCheck = Date.now()
        }
    }

    getHealthyProviders(): ProviderInfo[] {
        return Array.from(this.providers.values()).filter(p => p.isHealthy)
    }
}