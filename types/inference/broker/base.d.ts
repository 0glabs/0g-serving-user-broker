import { InferenceServingContract } from '../contract';
import { Metadata } from '../../common/storage';
import { Extractor } from '../extractor';
import { ServiceStructOutput } from '../contract';
import { ServingRequestHeaders } from './request';
import { Cache } from '../storage';
export declare abstract class ZGServingUserBrokerBase {
    protected contract: InferenceServingContract;
    protected metadata: Metadata;
    protected cache: Cache;
    constructor(contract: InferenceServingContract, metadata: Metadata, cache: Cache);
    protected getProviderData(providerAddress: string): Promise<{
        settleSignerPrivateKey: bigint[] | null;
    }>;
    protected getService(providerAddress: string, useCache?: boolean): Promise<ServiceStructOutput>;
    protected getExtractor(providerAddress: string, useCache?: boolean): Promise<Extractor>;
    protected createExtractor(svc: ServiceStructOutput): Extractor;
    protected a0giToNeuron(value: number): bigint;
    protected neuronToA0gi(value: bigint): number;
    getHeader(providerAddress: string, content: string, outputFee: bigint): Promise<ServingRequestHeaders>;
    calculateInputFees(extractor: Extractor, content: string): Promise<bigint>;
    updateCachedFee(provider: string, fee: bigint): Promise<void>;
    clearCacheFee(provider: string, fee: bigint): Promise<void>;
}
//# sourceMappingURL=base.d.ts.map