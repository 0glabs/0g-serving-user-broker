import {
    FineTuneAccountStruct,
    InferenceAccountStruct,
    FineTuneServingContract,
    InferenceServingContract,
    LedgerContract, LedgerStructOutput,
} from '../contract'
import { JsonRpcSigner, Wallet } from 'ethers'
import { RequestProcessor } from './inference/request'
import { ResponseProcessor } from './inference/response'
import { Verifier } from './inference/verifier'
import { AccountProcessor } from './account'
import { LedgerProcessor } from './ledger'
import { ModelProcessor } from './inference/model'
import { Metadata } from '../storage'
import { Cache } from '../storage'

export class ZGServingNetworkBroker {
    public requestProcessor!: RequestProcessor
    public responseProcessor!: ResponseProcessor
    public verifier!: Verifier
    public ledgerProcessor!: LedgerProcessor
    public modelProcessor!: ModelProcessor

    private signer: JsonRpcSigner | Wallet
    private ledgerContractAddr: string
    private inferenceContractAddr: string
    private finetuneContractAddr: string

    constructor(signer: JsonRpcSigner | Wallet,
                ledgerContractAddr,
                inferenceContractAddr,
                finetuneContractAddr) {
        this.signer = signer
        this.ledgerContractAddr = ledgerContractAddr
        this.inferenceContractAddr = inferenceContractAddr
        this.finetuneContractAddr = finetuneContractAddr
    }

    async initialize() {
        let userAddress: string
        try {
            userAddress = await this.signer.getAddress()
        } catch (error) {
            throw error
        }
        const inf_contract = new InferenceServingContract(
            this.signer,
            this.inferenceContractAddr,
            userAddress,
        )
        const ft_contract = new FineTuneServingContract(
            this.signer,
            this.finetuneContractAddr,
            userAddress,
        )
        const ledger_contract = new LedgerContract(
            this.signer,
            this.ledgerContractAddr,
            userAddress)

        const metadata = new Metadata()
        const cache = new Cache()
        this.requestProcessor = new RequestProcessor(inf_contract, metadata, cache)
        this.responseProcessor = new ResponseProcessor(
            inf_contract,
            metadata,
            cache,
        )

        this.ledgerProcessor = new LedgerProcessor(ledger_contract,
            inf_contract, ft_contract, metadata, cache)

        this.modelProcessor = new ModelProcessor(inf_contract, metadata, cache)
        this.verifier = new Verifier(inf_contract, metadata, cache)
    }

    /**
     * Retrieves a list of services from the contract.
     *
     * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
     * @throws An error if the service list cannot be retrieved.
     */
    public listInferenceService = async () => {
        try {
            return await this.modelProcessor.listService()
        } catch (error) {
            throw error
        }
    }

    public listFineTuneService = async () => {
        try {
            //todo: a predefined list?
        } catch (error) {
            throw error
        }
    }

    public addLedger = async (providerAddress: string, balance: number) => {
        try {
            return await this.ledgerProcessor.addLedger(
                balance,
            )
        } catch (error) {
            throw error
        }
    }

    public getLedger = async (): Promise<LedgerStructOutput> => {
        try {
            return await this.ledgerProcessor.getLedger()
        } catch (error) {
            throw error
        }
    }

    public depositFund = async (amount: number) => {
        try {
            return await this.ledgerProcessor.depositFund(amount)
        } catch (error) {
            throw error
        }
    }

    /**
     * Generates request metadata for the provider service.
     * Includes:
     * 1. Request endpoint for the provider service
     * 2. Model information for the provider service
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     *
     * @returns { endpoint, model } - Object containing endpoint and model.
     *
     * @throws An error if errors occur during the processing of the request.
     */
    public getInferenceServiceMetadata = async (
        providerAddress: string,
        svcName: string,
    ): Promise<{
        endpoint: string
        model: string
    }> => {
        try {
            return await this.requestProcessor.getServiceMetadata(
                providerAddress,
                svcName,
            )
        } catch (error) {
            throw error
        }
    }

    /**
     * getRequestHeaders generates billing-related headers for the request
     * when the user uses the provider service.
     *
     * In the 0G Serving system, a request with valid billing headers
     * is considered a settlement proof and will be used by the provider
     * for contract settlement.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     * @param {string} content - The content being billed. For example, in a chatbot service, it is the text input by the user.
     *
     * @returns headers. Records information such as the request fee and user signature.
     *
     * @example
     *
     * const { endpoint, model } = await broker.getServiceMetadata(
     *   providerAddress,
     *   serviceName,
     * );
     *
     * const headers = await broker.getServiceMetadata(
     *   providerAddress,
     *   serviceName,
     *   content,
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
    public getRequestHeaders = async (
        providerAddress: string,
        svcName: string,
        content: string,
    ) => {
        try {
            return await this.requestProcessor.getRequestHeaders(
                providerAddress,
                svcName,
                content,
            )
        } catch (error) {
            throw error
        }
    }

    /**
     * processResponse is used after the user successfully obtains a response from the provider service.
     *
     * It will settle the fee for the response content. Additionally, if the service is verifiable,
     * input the chat ID from the response and processResponse will determine the validity of the
     * returned content by checking the provider service's response and corresponding signature associated
     * with the chat ID.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     * @param {string} content - The main content returned by the service. For example, in the case of a chatbot service,
     * it would be the response text.
     * @param {string} chatID - Only for verifiable services. You can provide the chat ID obtained from the response to
     * automatically download the response signature. The function will verify the reliability of the response
     * using the service's signing address.
     *
     * @returns A boolean value. True indicates the returned content is valid, otherwise it is invalid.
     *
     * @throws An error if any issues occur during the processing of the response.
     */
    public processResponse = async (
        providerAddress: string,
        svcName: string,
        content: string,
        chatID?: string,
    ): Promise<boolean | null> => {
        try {
            return await this.responseProcessor.processResponse(
                providerAddress,
                svcName,
                content,
                chatID,
            )
        } catch (error) {
            throw error
        }
    }

    /**
     * verifyService is used to verify the reliability of the service.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     *
     * @returns A <boolean | null> value. True indicates the service is reliable, otherwise it is unreliable.
     *
     * @throws An error if errors occur during the verification process.
     */
    public verifyInferenceService = async (
        providerAddress: string,
        svcName: string,
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
     * @param {string} providerAddress - provider address.
     * @param {string} svcName - service name.
     *
     * @returns Download link.
     */
    public getSignerRaDownloadLink = async (
        providerAddress: string,
        svcName: string,
    ) => {
        try {
            return await this.verifier.getSignerRaDownloadLink(
                providerAddress,
                svcName,
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
     * @param {string} providerAddress - provider address.
     * @param {string} svcName - service name.
     * @param {string} chatID - ID of the chat.
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
        chatID: string,
    ) => {
        try {
            return await this.verifier.getChatSignatureDownloadLink(
                providerAddress,
                svcName,
                chatID,
            )
        } catch (error) {
            throw error
        }
    }

    /**
     * settleFee is used to settle the fee for the provider service.
     *
     * Normally, the fee for each request will be automatically settled in processResponse.
     * However, if processResponse fails due to network issues or other reasons,
     * you can manually call settleFee to settle the fee.
     *
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     * @param {number} fee - The fee to be settled. The unit of the fee is A0GI.
     *
     * @returns A promise that resolves when the fee settlement is successful.
     *
     * @throws An error if any issues occur during the fee settlement process.
     */
    public settleFeeForInference = async (
        providerAddress: string,
        svcName: string,
        fee: number,
    ): Promise<void> => {
        try {
            return await this.responseProcessor.settleFeeWithA0gi(
                providerAddress,
                svcName,
                fee,
            )
        } catch (error) {
            throw error
        }
    }


    //todo: API for finetune
    /**
     */

    public ackProviderSigner = async(providerAddress: string) => {

    }

}

/**
 * createZGServingNetworkBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
export async function createZGServingNetworkBroker(
    signer: JsonRpcSigner | Wallet,
    ledgerContractAddr = '0xE7F0998C83a81f04871BEdfD89aB5f2DAcDBf435',
    inferenceContractAddr = '0xE7F0998C83a81f04871BEdfD89aB5f2DAcDBf435',
    finetuneContractAddr = '0xE7F0998C83a81f04871BEdfD89aB5f2DAcDBf435',
): Promise<ZGServingNetworkBroker> {
    const broker = new ZGServingNetworkBroker(signer,
        ledgerContractAddr, inferenceContractAddr, finetuneContractAddr)
    try {
        await broker.initialize()
        return broker
    } catch (error) {
        throw error
    }
}
