import type { ProviderInfo, LoadBalancerOptions } from './types'
import { createLoadBalancingStrategy, type LoadBalancingStrategyInterface } from './strategies'
import { HealthChecker } from './health-checker'
import { SessionManager } from './session-manager'
import { createZGComputeNetworkBroker } from '../broker'
import type { JsonRpcSigner, Wallet } from 'ethers'

export class ProviderLoadBalancer {
    private providers: Map<string, ProviderInfo> = new Map()
    private strategy: LoadBalancingStrategyInterface
    private healthChecker: HealthChecker
    private sessionManager: SessionManager
    private maxRetries: number
    private signer: JsonRpcSigner | Wallet
    private ledgerCA?: string
    private inferenceCA?: string
    private fineTuningCA?: string
    private gasPrice?: number

    constructor(
        signer: JsonRpcSigner | Wallet,
        options: LoadBalancerOptions,
        ledgerCA?: string,
        inferenceCA?: string,
        fineTuningCA?: string,
        gasPrice?: number
    ) {
        this.signer = signer
        this.strategy = createLoadBalancingStrategy(options.strategy)
        this.maxRetries = options.maxRetries
        this.sessionManager = new SessionManager(options.sessionTimeout)
        this.ledgerCA = ledgerCA
        this.inferenceCA = inferenceCA
        this.fineTuningCA = fineTuningCA
        this.gasPrice = gasPrice

        this.initializeProviders(options.providers)
        this.healthChecker = new HealthChecker(this.providers, options.healthCheckInterval)
    }

    private initializeProviders(providerAddresses: string[]): void {
        for (const address of providerAddresses) {
            const provider: ProviderInfo = {
                address,
                endpoint: '',
                model: '',
                isHealthy: false,
                connections: 0,
                weight: 1,
                lastHealthCheck: 0,
                broker: null
            }
            this.providers.set(address, provider)
        }
    }

    async initialize(): Promise<void> {
        console.log('Initializing providers...')
        
        for (const [address, provider] of this.providers.entries()) {
            try {
                console.log(`Initializing provider: ${address}`)
                
                const broker = await createZGComputeNetworkBroker(
                    this.signer,
                    this.ledgerCA,
                    this.inferenceCA,
                    this.fineTuningCA,
                    this.gasPrice
                )

                await broker.inference.acknowledgeProviderSigner(address)
                const meta = await broker.inference.getServiceMetadata(address)
                
                provider.broker = broker
                provider.endpoint = meta.endpoint
                provider.model = meta.model
                provider.isHealthy = true
                provider.lastHealthCheck = Date.now()
                
                console.log(`Provider ${address} initialized successfully`)
            } catch (error) {
                console.error(`Failed to initialize provider ${address}:`, error)
                provider.isHealthy = false
            }
        }

        this.healthChecker.start()
        console.log('Load balancer initialization completed')
    }

    selectProvider(sessionId?: string): ProviderInfo | null {
        const healthyProviders = this.getHealthyProviders()
        if (healthyProviders.length === 0) {
            throw new Error('No healthy providers available')
        }

        return this.strategy.selectProvider(healthyProviders)
    }

    assignProviderForRequest(requestId: string, sessionId?: string): { sessionId: string, provider: ProviderInfo } {
        let provider: ProviderInfo | null = null

        if (sessionId) {
            const sessionProvider = this.sessionManager.getProviderForRequest(requestId)
            if (sessionProvider) {
                provider = this.providers.get(sessionProvider) || null
            }
        }

        if (!provider) {
            provider = this.selectProvider(sessionId)
            if (!provider) {
                throw new Error('No available providers')
            }
        }

        const { sessionId: finalSessionId } = this.sessionManager.assignProvider(
            requestId, 
            provider.address, 
            sessionId
        )

        provider.connections++
        
        return { sessionId: finalSessionId, provider }
    }

    getProviderForRequest(requestId: string): ProviderInfo | null {
        const providerAddress = this.sessionManager.getProviderForRequest(requestId)
        return providerAddress ? this.providers.get(providerAddress) || null : null
    }

    releaseProvider(requestId: string): void {
        const provider = this.getProviderForRequest(requestId)
        if (provider && provider.connections > 0) {
            provider.connections--
        }
    }

    getHealthyProviders(): ProviderInfo[] {
        return Array.from(this.providers.values()).filter(p => p.isHealthy)
    }

    getAllProviders(): ProviderInfo[] {
        return Array.from(this.providers.values())
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
        }
        return stats
    }

    async retryWithDifferentProvider<T>(
        operation: (provider: ProviderInfo) => Promise<T>,
        excludeProviders: Set<string> = new Set(),
        requestId?: string
    ): Promise<T> {
        let lastError: Error | null = null
        let attempts = 0

        while (attempts < this.maxRetries) {
            try {
                const availableProviders = this.getHealthyProviders().filter(
                    p => !excludeProviders.has(p.address)
                )

                if (availableProviders.length === 0) {
                    throw new Error('No available providers for retry')
                }

                const provider = this.strategy.selectProvider(availableProviders)
                if (!provider) {
                    throw new Error('Load balancer returned no provider')
                }

                return await operation(provider)
            } catch (error) {
                lastError = error as Error
                attempts++
                
                const failedProvider = this.getHealthyProviders().find(p => !excludeProviders.has(p.address))
                if (failedProvider) {
                    excludeProviders.add(failedProvider.address)
                    failedProvider.isHealthy = false
                }
                
                console.warn(`Retry attempt ${attempts} failed:`, error)
            }
        }

        throw new Error(`All retry attempts failed. Last error: ${lastError?.message}`)
    }

    destroy(): void {
        this.healthChecker.stop()
    }
}