import type { ProviderInfo } from './types';
export declare class HealthChecker {
    private providers;
    private checkInterval;
    private intervalId?;
    constructor(providers: Map<string, ProviderInfo>, checkInterval: number);
    start(): void;
    stop(): void;
    private scheduleHealthCheck;
    private checkProvider;
    private markProviderUnhealthy;
    markProviderHealthy(providerAddress: string): void;
    getHealthyProviders(): ProviderInfo[];
}
//# sourceMappingURL=health-checker.d.ts.map