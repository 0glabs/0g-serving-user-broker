import { ZGServingUserBrokerBase } from './base';
import { Cache } from '../storage';
import { InferenceServingContract, ServiceStructOutput } from '../contract';
import { LedgerBroker } from '../../ledger';
import { Metadata } from '../../common/storage';
/**
 * ServingRequestHeaders contains headers related to request billing.
 * These need to be added to the request.
 */
export interface ServingRequestHeaders {
    'X-Phala-Signature-Type': 'StandaloneApi';
    /**
     * User's address
     */
    Address: string;
    /**
     * Total fee for the request.
     * Equals 'Input-Fee' + 'Previous-Output-Fee'
     */
    Fee: string;
    /**
     * Fee required for the input of this request.
     * For example, for a chatbot service,
     * 'Input-Fee' = number of tokens input by the user * price per token
     */
    'Input-Fee': string;
    Nonce: string;
    /**
     * Fee returned from the previous request.
     * In the 0G Serving system, the request is the only payment proof,
     * so the fee returned from the previous request will be included in the current request.
     * For example, for a chatbot service,
     * 'Previous-Output-Fee' = number of tokens returned by the service in the previous round * price per token
     */
    'Previous-Output-Fee': string;
    /**
     * Service name
     */
    'Service-Name': string;
    /**
     * User's signature for the other headers.
     * By adding this information, the user gives the current request the characteristics of a settlement proof.
     */
    Signature: string;
}
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export declare class RequestProcessor extends ZGServingUserBrokerBase {
    private checkAccountThreshold;
    private topUpTriggerThreshold;
    private topUpTargetThreshold;
    private ledger;
    constructor(contract: InferenceServingContract, metadata: Metadata, cache: Cache, ledger: LedgerBroker);
    getServiceMetadata(providerAddress: string, svcName: string): Promise<{
        endpoint: string;
        model: string;
    }>;
    getRequestHeaders(providerAddress: string, svcName: string, content: string): Promise<ServingRequestHeaders>;
    /**
     * Check the cache fund for this provider, return true if the fund is above 1000 * (inputPrice + outputPrice)
     * @param provider
     * @param svc
     */
    shouldCheckAccount(svc: ServiceStructOutput): Promise<boolean>;
    /**
     * Transfer fund from ledger if fund in the inference account is less than a 5000 * (inputPrice + outputPrice)
     * @param provider
     * @param svcName
     */
    topUpAccountIfNeeded(provider: string, svcName: string, content: string): Promise<void>;
}
//# sourceMappingURL=request.d.ts.map