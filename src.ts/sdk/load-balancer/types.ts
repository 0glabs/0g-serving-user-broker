export interface ProviderInfo {
    address: string
    endpoint: string
    model: string
    isHealthy: boolean
    connections: number
    weight: number
    lastHealthCheck: number
    broker?: any
}

export interface SessionInfo {
    sessionId: string
    providerAddress: string
    requestIds: string[]
    createdAt: number
    lastActivity: number
}

export interface LoadBalancerOptions {
    providers: string[]
    strategy: LoadBalancingStrategy
    healthCheckInterval: number
    maxRetries: number
    sessionTimeout: number
}

export type LoadBalancingStrategy = 'round-robin' | 'least-connections' | 'weighted-round-robin'

export interface CacheEntry {
    content: string
    providerAddress: string
    sessionId: string
    timestamp: number
}