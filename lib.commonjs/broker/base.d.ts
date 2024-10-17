import { ServingContract } from '../contract';
import { Extractor } from '../extractor';
import { ServiceStructOutput } from '../contract/serving/Serving';
export declare abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract;
    protected isConnected: boolean;
    constructor(contract: ServingContract);
    protected getProviderData(providerAddress: string): Promise<{
        nonce: number | null;
        outputFee: number | null;
        privateKey: bigint[] | null;
    }>;
    protected getService(providerAddress: string, svcName: string, useCache?: boolean): Promise<ServiceStructOutput>;
    protected getExtractor(providerAddress: string, svcName: string, useCache?: boolean): Promise<Extractor>;
    protected createExtractor(svc: ServiceStructOutput): Extractor;
}
//# sourceMappingURL=base.d.ts.map