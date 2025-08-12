import type { ProviderInfo, LoadBalancingStrategy } from './types';
export interface LoadBalancingStrategyInterface {
    selectProvider(providers: ProviderInfo[]): ProviderInfo | null;
}
export declare class RoundRobinStrategy implements LoadBalancingStrategyInterface {
    private currentIndex;
    selectProvider(providers: ProviderInfo[]): ProviderInfo | null;
}
export declare class LeastConnectionsStrategy implements LoadBalancingStrategyInterface {
    selectProvider(providers: ProviderInfo[]): ProviderInfo | null;
}
export declare class WeightedRoundRobinStrategy implements LoadBalancingStrategyInterface {
    private currentWeights;
    selectProvider(providers: ProviderInfo[]): ProviderInfo | null;
}
export declare function createLoadBalancingStrategy(strategy: LoadBalancingStrategy): LoadBalancingStrategyInterface;
//# sourceMappingURL=strategies.d.ts.map