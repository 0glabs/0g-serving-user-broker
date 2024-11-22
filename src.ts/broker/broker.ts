import { ServingContract } from '../contract'
import { JsonRpcSigner, Wallet } from 'ethers'
import { RequestProcessor, ServingRequestHeaders } from './request'
import { ResponseProcessor } from './response'
import { Verifier } from './verifier'
import { AccountProcessor } from './account'
import { ModelProcessor } from './model'
import { Metadata } from '../storage'
import { Cache } from '../storage'

export class ZGServingNetworkBroker {
    public requestProcessor!: RequestProcessor
    public responseProcessor!: ResponseProcessor
    public verifier!: Verifier
    public accountProcessor!: AccountProcessor
    public modelProcessor!: ModelProcessor

    private signer: JsonRpcSigner | Wallet
    private customPath: string
    private contractAddress: string

    constructor(
        signer: JsonRpcSigner | Wallet,
        customPath: string,
        contractAddress: string
    ) {
        this.signer = signer
        this.customPath = customPath
        this.contractAddress = contractAddress
    }

    async initialize() {
        let userAddress: string
        try {
            userAddress = await this.signer.getAddress()
        } catch (error) {
            throw error
        }
        const contract = new ServingContract(
            this.signer,
            this.contractAddress,
            userAddress
        )
        const metadata = new Metadata(this.customPath)
        const cache = new Cache(this.customPath)
        this.requestProcessor = new RequestProcessor(contract, metadata, cache)
        this.responseProcessor = new ResponseProcessor(
            contract,
            metadata,
            cache
        )
        this.accountProcessor = new AccountProcessor(contract, metadata, cache)
        this.modelProcessor = new ModelProcessor(contract, metadata, cache)
        this.verifier = new Verifier(contract, metadata, cache)
    }

    /**
     * Retrieves a list of services from the contract.
     *
     * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
     * @throws An error if the service list cannot be retrieved.
     */
    public listService = async () => {
        try {
            return await this.modelProcessor.listService()
        } catch (error) {
            throw error
        }
    }

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
    public addAccount = async (account: string, balance: string) => {
        try {
            return await this.accountProcessor.addAccount(account, balance)
        } catch (error) {
            throw error
        }
    }

    /**
     * Deposits a specified amount of funds into the given account.
     *
     * @param {string} account - The account identifier where the funds will be deposited.
     * @param {string} amount - The amount of funds to be deposited.
     * @throws  An error if the deposit fails.
     */
    public depositFund = async (account: string, amount: string) => {
        try {
            return await this.accountProcessor.depositFund(account, amount)
        } catch (error) {
            throw error
        }
    }

    /**
     * Generates request metadata for the provider service.
     * Includes:
     * 1. Request endpoint for the provider service
     * 2. Billing-related headers for the request
     * 3. Model information for the provider service
     *
     * In the 0G Serving system, a request with valid billing headers
     * is considered a settlement proof and will be used by the provider
     * for contract settlement.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @param content - The content being billed. For example, in a chatbot service, it is the text input by the user.
     *
     * @returns { endpoint, headers, model } - Object containing endpoint, headers, and model.
     * @example
     *
     * const { endpoint, headers, model } = await broker.requestProcessor.getRequestMetadata(
     *   providerAddress,
     *   serviceName,
     *   content
     * );
     *
     * const openai = new OpenAI({
     *   baseURL: endpoint,
     *   apiKey: "",
     * });
     *
     * const completion = await openai.chat.completions.create(
     *   {
     *     messages: [{ role: "system", content }],
     *     model,
     *   },
     *   headers: {
     *     ...headers,
     *   },
     * );
     *
     * @throws An error if errors occur during the processing of the request.
     */
    public getRequestMetadata = async (
        providerAddress: string,
        svcName: string,
        content: string
    ): Promise<{
        endpoint: string
        headers: ServingRequestHeaders
        model: string
    }> => {
        try {
            return await this.requestProcessor.getRequestMetadata(
                providerAddress,
                svcName,
                content
            )
        } catch (error) {
            throw error
        }
    }

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
    public processResponse = async (
        providerAddress: string,
        svcName: string,
        content: string,
        chatID?: string
    ): Promise<boolean | null> => {
        try {
            return await this.responseProcessor.processResponse(
                providerAddress,
                svcName,
                content,
                chatID
            )
        } catch (error) {
            throw error
        }
    }

    /**
     * verifyService is used to verify the reliability of the service.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @returns A <boolean | null> value. True indicates the service is reliable, otherwise it is unreliable.
     * @throws An error if errors occur during the verification process.
     */
    public verifyService = async (
        providerAddress: string,
        svcName: string
    ): Promise<boolean | null> => {
        try {
            return await this.verifier.verifyService(providerAddress, svcName)
        } catch (error) {
            throw error
        }
    }

    /**
     * getSignerRaDownloadLink returns the download link for the Signer RA.
     *
     * It can be provided to users who wish to manually verify the Signer RA.
     *
     * @param providerAddress - provider address.
     * @param svcName - service name.
     * @returns Download link.
     */
    public getSignerRaDownloadLink = async (
        providerAddress: string,
        svcName: string
    ) => {
        try {
            return await this.verifier.getSignerRaDownloadLink(
                providerAddress,
                svcName
            )
        } catch (error) {
            throw error
        }
    }

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
    public getChatSignatureDownloadLink = async (
        providerAddress: string,
        svcName: string,
        chatID: string
    ) => {
        try {
            return await this.verifier.getChatSignatureDownloadLink(
                providerAddress,
                svcName,
                chatID
            )
        } catch (error) {
            throw error
        }
    }
}

/**
 * createZGServingNetworkBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 * @returns broker instance.
 * @throws An error if the broker cannot be initialized.
 */
export async function createZGServingNetworkBroker(
    signer: JsonRpcSigner | Wallet,
    customPath: string,
    contractAddress = '0x9Ae9b2C822beFF4B4466075006bc6b5ac35E779F'
): Promise<ZGServingNetworkBroker> {
    const broker = new ZGServingNetworkBroker(
        signer,
        customPath,
        contractAddress
    )
    try {
        await broker.initialize()
        return broker
    } catch (error) {
        throw error
    }
}
