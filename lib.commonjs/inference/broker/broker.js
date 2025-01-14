"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZGServingNetworkBroker = void 0;
exports.createZGServingNetworkBroker = createZGServingNetworkBroker;
const inference_1 = require("../../contract/inference");
const request_1 = require("./request");
const response_1 = require("./response");
const verifier_1 = require("./verifier");
const account_1 = require("./account");
const model_1 = require("./model");
const storage_1 = require("../storage");
const storage_2 = require("../storage");
class ZGServingNetworkBroker {
    requestProcessor;
    responseProcessor;
    verifier;
    accountProcessor;
    modelProcessor;
    signer;
    contractAddress;
    constructor(signer, contractAddress) {
        this.signer = signer;
        this.contractAddress = contractAddress;
    }
    async initialize() {
        let userAddress;
        try {
            userAddress = await this.signer.getAddress();
        }
        catch (error) {
            throw error;
        }
        const contract = new inference_1.InferenceServingContract(this.signer, this.contractAddress, userAddress);
        const metadata = new storage_1.Metadata();
        const cache = new storage_2.Cache();
        this.requestProcessor = new request_1.RequestProcessor(contract, metadata, cache);
        this.responseProcessor = new response_1.ResponseProcessor(contract, metadata, cache);
        this.accountProcessor = new account_1.AccountProcessor(contract, metadata, cache);
        this.modelProcessor = new model_1.ModelProcessor(contract, metadata, cache);
        this.verifier = new verifier_1.Verifier(contract, metadata, cache);
    }
    /**
     * Retrieves a list of services from the contract.
     *
     * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
     * @throws An error if the service list cannot be retrieved.
     */
    listService = async () => {
        try {
            return await this.modelProcessor.listService();
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Adds a new account to the contract.
     *
     * @param {string} providerAddress - The address of the provider for whom the account is being created.
     * @param {number} balance - The initial balance to be assigned to the new account. Units are in A0GI.
     *
     * @throws  An error if the account creation fails.
     *
     * @remarks
     * When creating an account, a key pair is also created to sign the request.
     */
    addAccount = async (providerAddress, balance) => {
        try {
            return await this.accountProcessor.addAccount(providerAddress, balance);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Retrieves the account information for a given provider address.
     *
     * @param {string} providerAddress - The address of the provider identifying the account.
     *
     * @returns A promise that resolves to the account information.
     *
     * @throws Will throw an error if the account retrieval process fails.
     */
    getAccount = async (providerAddress) => {
        try {
            return await this.accountProcessor.getAccount(providerAddress);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Deposits a specified amount of funds into the given account.
     *
     * @param {string} account - The account identifier where the funds will be deposited.
     * @param {string} amount - The amount of funds to be deposited. Units are in A0GI.
     * @throws  An error if the deposit fails.
     */
    depositFund = async (account, amount) => {
        try {
            return await this.accountProcessor.depositFund(account, amount);
        }
        catch (error) {
            throw error;
        }
    };
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
    getServiceMetadata = async (providerAddress, svcName) => {
        try {
            return await this.requestProcessor.getServiceMetadata(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    };
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
    getRequestHeaders = async (providerAddress, svcName, content) => {
        try {
            return await this.requestProcessor.getRequestHeaders(providerAddress, svcName, content);
        }
        catch (error) {
            throw error;
        }
    };
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
    processResponse = async (providerAddress, svcName, content, chatID) => {
        try {
            return await this.responseProcessor.processResponse(providerAddress, svcName, content, chatID);
        }
        catch (error) {
            throw error;
        }
    };
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
    verifyService = async (providerAddress, svcName) => {
        try {
            return await this.verifier.verifyService(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    };
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
    getSignerRaDownloadLink = async (providerAddress, svcName) => {
        try {
            return await this.verifier.getSignerRaDownloadLink(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    };
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
    getChatSignatureDownloadLink = async (providerAddress, svcName, chatID) => {
        try {
            return await this.verifier.getChatSignatureDownloadLink(providerAddress, svcName, chatID);
        }
        catch (error) {
            throw error;
        }
    };
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
    settleFee = async (providerAddress, svcName, fee) => {
        try {
            return await this.responseProcessor.settleFeeWithA0gi(providerAddress, svcName, fee);
        }
        catch (error) {
            throw error;
        }
    };
}
exports.ZGServingNetworkBroker = ZGServingNetworkBroker;
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
async function createZGServingNetworkBroker(signer, contractAddress = '0xE7F0998C83a81f04871BEdfD89aB5f2DAcDBf435') {
    const broker = new ZGServingNetworkBroker(signer, contractAddress);
    try {
        await broker.initialize();
        return broker;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=broker.js.map