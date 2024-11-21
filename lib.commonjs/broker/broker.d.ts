import { JsonRpcSigner, Wallet } from 'ethers';
import { RequestProcessor } from './request';
import { ResponseProcessor } from './response';
import { Verifier } from './verifier';
import { AccountProcessor } from './account';
import { ModelProcessor } from './model';
export declare class ZGServingNetworkBroker {
    requestProcessor: RequestProcessor;
    responseProcessor: ResponseProcessor;
    verifier: Verifier;
    accountProcessor: AccountProcessor;
    modelProcessor: ModelProcessor;
    private signer;
    private customPath;
    private contractAddress;
    constructor(signer: JsonRpcSigner | Wallet, customPath: string, contractAddress: string);
    initialize(): Promise<void>;
    /**
     * Retrieves a list of services from the contract.
     *
     * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
     * @throws An error if the service list cannot be retrieved.
     */
    listService: () => Promise<import("../contract").ServiceStructOutput[]>;
    /**
     * Adds a new account to the contract.
     *
     * @param providerAddress - The address of the provider for whom the account is being created.
     * @param balance - The initial balance to be assigned to the new account.
     *
     * @throws  An error if the account creation fails.
     *
     * @remarks
     * When creating an account, a key pair is also created to sign the request.
     */
    addAccount: (account: string, balance: string) => Promise<void>;
    /**
     * Deposits a specified amount of funds into the given account.
     *
     * @param {string} account - The account identifier where the funds will be deposited.
     * @param {string} amount - The amount of funds to be deposited.
     * @throws  An error if the deposit fails.
     */
    depositFund: (account: string, amount: string) => Promise<void>;
    /**
     * processRequest generates billing-related headers for the request
     * when the user uses the provider service.
     *
     * In the 0G Serving system, a request with valid billing headers
     * is considered a settlement proof and will be used by the provider
     * for contract settlement.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @param content - The content being billed. For example, in a chatbot service, it is the text input by the user.
     * @returns headers. Records information such as the request fee and user signature.
     * @throws An error if errors occur during the processing of the request.
     */
    processRequest: (providerAddress: string, svcName: string, content: string) => Promise<import("./request").ServingRequestHeaders>;
    /**
     * processResponse is used after the user successfully obtains a response from the provider service.
     *
     * processResponse extracts necessary information from the response and records it
     * in localStorage for generating billing headers for subsequent requests.
     *
     * Additionally, if the service is verifiable, input the chat ID from the response and
     * processResponse will determine the validity of the returned content by checking the
     * provider service's response and corresponding signature corresponding to the chat ID.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @param content - The main content returned by the service. For example, in the case of a chatbot service,
     * it would be the response text.
     * @param chatID - Only for verifiable service. You can fill in the chat ID obtained from response to
     * automatically download the response signature. The function will verify the reliability of the response
     * using the service's signing address.
     * @returns A boolean value. True indicates the returned content is valid, otherwise it is invalid.
     * @throws An error if errors occur during the processing of the response.
     */
    processResponse: (providerAddress: string, svcName: string, content: string, chatID?: string) => Promise<boolean | null>;
    /**
     * verifyService is used to verify the reliability of the service.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @returns A <boolean | null> value. True indicates the service is reliable, otherwise it is unreliable.
     * @throws An error if errors occur during the verification process.
     */
    verifyService: (providerAddress: string, svcName: string) => Promise<boolean | null>;
    /**
     * getSignerRaDownloadLink returns the download link for the Signer RA.
     *
     * It can be provided to users who wish to manually verify the Signer RA.
     *
     * @param providerAddress - provider address.
     * @param svcName - service name.
     * @returns Download link.
     */
    getSignerRaDownloadLink: (providerAddress: string, svcName: string) => Promise<string>;
    /**
     * getChatSignatureDownloadLink returns the download link for the signature of a single chat.
     *
     * It can be provided to users who wish to manually verify the content of a single chat.
     *
     * @param providerAddress - provider address.
     * @param svcName - service name.
     * @param chatID - ID of the chat.
     *
     * @description To verify the chat signature, use the following code:
     *
     * ```typescript
     * const messageHash = ethers.hashMessage(messageToBeVerified)
     * const recoveredAddress = ethers.recoverAddress(messageHash, signature)
     * const isValid = recoveredAddress.toLowerCase() === signingAddress.toLowerCase()
     * ```
     *
     * @returns Download link.
     */
    getChatSignatureDownloadLink: (providerAddress: string, svcName: string, chatID: string) => Promise<string>;
}
/**
 * createZGServingNetworkBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 * @returns broker instance.
 * @throws An error if the broker cannot be initialized.
 */
export declare function createZGServingNetworkBroker(signer: JsonRpcSigner | Wallet, customPath: string, contractAddress?: string): Promise<ZGServingNetworkBroker>;
//# sourceMappingURL=broker.d.ts.map