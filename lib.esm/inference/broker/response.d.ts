import { InferenceServingContract } from '../../contract/inference';
import { Cache, Metadata } from '../../common/storage';
import { ZGServingUserBrokerBase } from './base';
/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export declare class ResponseProcessor extends ZGServingUserBrokerBase {
    private verifier;
    constructor(contract: InferenceServingContract, metadata: Metadata, cache: Cache);
    settleFeeWithA0gi(providerAddress: string, serviceName: string, fee: number): Promise<void>;
    /**
     * settleFee sends an empty request to the service provider to settle the fee.
     */
    settleFee(providerAddress: string, serviceName: string, fee: bigint): Promise<void>;
    processResponse(providerAddress: string, svcName: string, content: string, chatID?: string): Promise<boolean | null>;
    private calculateOutputFees;
}
//# sourceMappingURL=response.d.ts.map