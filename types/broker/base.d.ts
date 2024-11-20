import { ServingContract } from '../contract';
import { Cache, Metadata } from '../storage';
import { Extractor } from '../extractor';
import { ServiceStructOutput } from '../contract/serving/Serving';
export declare abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract;
    protected metadata: Metadata;
    protected cache: Cache;
    constructor(contract: ServingContract, metadata: Metadata, cache: Cache);
    protected getProviderData(providerAddress: string): Promise<{
        nonce: number | null;
        outputFee: number | null;
        zkPrivateKey: bigint[] | null;
    }>;
    protected getService(providerAddress: string, svcName: string, useCache?: boolean): Promise<ServiceStructOutput>;
    protected getExtractor(providerAddress: string, svcName: string, useCache?: boolean): Promise<Extractor>;
    protected createExtractor(svc: ServiceStructOutput): Extractor;
}
//# sourceMappingURL=base.d.ts.map