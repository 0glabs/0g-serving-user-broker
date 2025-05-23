import { ZGServingUserBrokerBase } from './base';
import { Cache, Metadata } from '../../common/storage';
import { InferenceServingContract } from '../contract';
import { LedgerBroker } from '../../ledger';
import { Automata } from '../../common/automata ';
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
    /**
     * Pedersen hash for nonce, user address and provider address
     */
    'Request-Hash': string;
    Nonce: string;
    /**
     * User's signature for the other headers.
     * By adding this information, the user gives the current request the characteristics of a settlement proof.
     */
    Signature: string;
}
export interface QuoteResponse {
    quote: string;
    provider_signer: string;
    key: [bigint, bigint];
}
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export declare class RequestProcessor extends ZGServingUserBrokerBase {
    protected automata: Automata;
    constructor(contract: InferenceServingContract, metadata: Metadata, cache: Cache, ledger: LedgerBroker);
    getServiceMetadata(providerAddress: string): Promise<{
        endpoint: string;
        model: string;
    }>;
    getRequestHeaders(providerAddress: string, content: string): Promise<ServingRequestHeaders>;
    acknowledgeProviderSigner(providerAddress: string, gasPrice?: number): Promise<void>;
    getQuote(providerAddress: string): Promise<QuoteResponse>;
    private fetchText;
}
//# sourceMappingURL=request.d.ts.map