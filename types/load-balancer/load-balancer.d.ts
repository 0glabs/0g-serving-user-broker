import type { ProviderInfo, LoadBalancerOptions } from './types';
import type { JsonRpcSigner, Wallet } from 'ethers';
export declare class ProviderLoadBalancer {
    private providers;
    private strategy;
    private healthChecker;
    private sessionManager;
    private maxRetries;
    private signer;
    private ledgerCA?;
    private inferenceCA?;
    private fineTuningCA?;
    private gasPrice?;
    constructor(signer: JsonRpcSigner | Wallet, options: LoadBalancerOptions, ledgerCA?: string, inferenceCA?: string, fineTuningCA?: string, gasPrice?: number);
    private initializeProviders;
    initialize(): Promise<void>;
    selectProvider(sessionId?: string): ProviderInfo | null;
    assignProviderForRequest(requestId: string, sessionId?: string): {
        sessionId: string;
        provider: ProviderInfo;
    };
    getProviderForRequest(requestId: string): ProviderInfo | null;
    releaseProvider(requestId: string): void;
    getHealthyProviders(): ProviderInfo[];
    getAllProviders(): ProviderInfo[];
    getProviderStats(): {
        totalProviders: number;
        healthyProviders: number;
        totalConnections: number;
        activeSessions: number;
        providers: {
            address: string;
            endpoint: string;
            model: string;
            isHealthy: boolean;
            connections: number;
            lastHealthCheck: number;
        }[];
    };
    retryWithDifferentProvider<T>(operation: (provider: ProviderInfo) => Promise<T>, excludeProviders?: Set<string>, requestId?: string): Promise<T>;
    destroy(): void;
}
//# sourceMappingURL=load-balancer.d.ts.map