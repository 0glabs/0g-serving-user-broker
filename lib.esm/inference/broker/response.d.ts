import { InferenceServingContract } from '../contract';
import { Metadata, Cache } from '../../common/storage';
import { ZGServingUserBrokerBase } from './base';
import { LedgerBroker } from '../../ledger';
/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export declare class ResponseProcessor extends ZGServingUserBrokerBase {
    private verifier;
    constructor(contract: InferenceServingContract, ledger: LedgerBroker, metadata: Metadata, cache: Cache);
    settleFeeWithA0gi(providerAddress: string, fee: number): Promise<void>;
    /**
     * settleFee sends an empty request to the service provider to settle the fee.
     */
    settleFee(providerAddress: string, fee: bigint): Promise<void>;
    processResponse(providerAddress: string, content: string, chatID?: string): Promise<boolean | null>;
    private calculateOutputFees;
}
//# sourceMappingURL=response.d.ts.map