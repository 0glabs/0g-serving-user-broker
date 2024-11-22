import { ServingContract } from '../contract';
import { Cache, Metadata } from '../storage';
import { Extractor } from '../extractor';
import { ServiceStructOutput } from '../contract/serving/Serving';
import { ServingRequestHeaders } from './request';
export declare abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract;
    protected metadata: Metadata;
    protected cache: Cache;
    constructor(contract: ServingContract, metadata: Metadata, cache: Cache);
    protected getProviderData(providerAddress: string): Promise<{
        settleSignerPrivateKey: bigint[] | null;
    }>;
    protected getService(providerAddress: string, svcName: string, useCache?: boolean): Promise<ServiceStructOutput>;
    protected getExtractor(providerAddress: string, svcName: string, useCache?: boolean): Promise<Extractor>;
    protected createExtractor(svc: ServiceStructOutput): Extractor;
    getHeader(providerAddress: string, svcName: string, content: string, outputFee: number): Promise<ServingRequestHeaders>;
    private calculateInputFees;
}
//# sourceMappingURL=base.d.ts.map