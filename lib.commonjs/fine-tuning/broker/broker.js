"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FineTuningBroker = void 0;
exports.createFineTuningBroker = createFineTuningBroker;
const contract_1 = require("../contract");
const model_1 = require("./model");
const service_1 = require("./service");
const provider_1 = require("../provider/provider");
class FineTuningBroker {
    signer;
    fineTuningCA;
    ledger;
    modelProcessor;
    serviceProcessor;
    serviceProvider;
    constructor(signer, fineTuningCA, ledger) {
        this.signer = signer;
        this.fineTuningCA = fineTuningCA;
        this.ledger = ledger;
    }
    async initialize() {
        let userAddress;
        try {
            userAddress = await this.signer.getAddress();
        }
        catch (error) {
            throw error;
        }
        const contract = new contract_1.FineTuningServingContract(this.signer, this.fineTuningCA, userAddress);
        this.serviceProvider = new provider_1.Provider(contract);
        this.modelProcessor = new model_1.ModelProcessor(contract, this.ledger, this.serviceProvider);
        this.serviceProcessor = new service_1.ServiceProcessor(contract, this.ledger, this.serviceProvider);
    }
    listService = async () => {
        try {
            return await this.serviceProcessor.listService();
        }
        catch (error) {
            throw error;
        }
    };
    getAccount = async (providerAddress) => {
        try {
            return await this.serviceProcessor.getAccount(providerAddress);
        }
        catch (error) {
            throw error;
        }
    };
    acknowledgeProviderSigner = async (providerAddress, serviceName) => {
        try {
            return await this.serviceProcessor.acknowledgeProviderSigner(providerAddress, serviceName);
        }
        catch (error) {
            throw error;
        }
    };
    listModel = () => {
        try {
            return this.modelProcessor.listModel();
        }
        catch (error) {
            throw error;
        }
    };
    uploadDataset = async (dataPath) => {
        try {
            await this.modelProcessor.uploadDataset(this.signer.privateKey, dataPath);
        }
        catch (error) {
            throw error;
        }
    };
    downloadDataset = async (dataPath, dataRoot) => {
        try {
            await this.modelProcessor.downloadDataset(dataPath, dataRoot);
        }
        catch (error) {
            throw error;
        }
    };
    createTask = async (providerAddress, serviceName, preTrainedModelName, dataSize, datasetHash, trainingPath) => {
        try {
            return await this.serviceProcessor.createTask(providerAddress, serviceName, preTrainedModelName, dataSize, datasetHash, trainingPath);
        }
        catch (error) {
            throw error;
        }
    };
    getTask = async (providerAddress, serviceName, taskID) => {
        try {
            const task = await this.serviceProcessor.getTask(providerAddress, serviceName, taskID);
            return task;
        }
        catch (error) {
            throw error;
        }
    };
    getLog = async (providerAddress, serviceName, taskID) => {
        try {
            return await this.serviceProcessor.getLog(providerAddress, serviceName, taskID);
        }
        catch (error) {
            throw error;
        }
    };
    acknowledgeModel = async (providerAddress, dataPath) => {
        try {
            return await this.modelProcessor.acknowledgeModel(providerAddress, dataPath);
        }
        catch (error) {
            throw error;
        }
    };
    decryptModel = async (providerAddress, encryptedModelPath, decryptedModelPath) => {
        try {
            return await this.modelProcessor.decryptModel(providerAddress, encryptedModelPath, decryptedModelPath);
        }
        catch (error) {
            throw error;
        }
    };
}
exports.FineTuningBroker = FineTuningBroker;
/**
 * createFineTuningBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
async function createFineTuningBroker(signer, contractAddress = '', ledger) {
    const broker = new FineTuningBroker(signer, contractAddress, ledger);
    try {
        await broker.initialize();
        return broker;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=broker.js.map