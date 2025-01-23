import { ZGComputeNetworkBroker } from '../sdk';
export declare function initBroker(options: any): Promise<ZGComputeNetworkBroker>;
export declare function withLedgerBroker(options: any, action: (broker: ZGComputeNetworkBroker) => Promise<void>): Promise<void>;
export declare function withFineTuningBroker(options: any, action: (broker: ZGComputeNetworkBroker) => Promise<void>): Promise<void>;
export declare const neuronToA0gi: (value: bigint) => number;
export declare const splitIntoChunks: (str: string, size: number) => string;
//# sourceMappingURL=util.d.ts.map