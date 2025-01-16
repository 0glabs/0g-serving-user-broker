"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FineTuningBroker = void 0;
exports.createFineTuningBroker = createFineTuningBroker;
const contract_1 = require("../contract");
const model_1 = require("./model");
const service_1 = require("./service");
const zg_storage_1 = require("../zg-storage/zg-storage");
const provider_1 = require("../provider/provider");
class FineTuningBroker {
    signer;
    fineTuningCA;
    ledger;
    modelProcessor;
    serviceProcessor;
    zgClient;
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
        this.modelProcessor = new model_1.ModelProcessor(contract, this.ledger, this.zgClient, this.serviceProvider);
        this.serviceProcessor = new service_1.ServiceProcessor(contract, this.ledger, this.zgClient, this.serviceProvider);
        this.serviceProvider = new provider_1.Provider(contract);
        this.zgClient = new zg_storage_1.ZGStorage();
    }
    listService = async () => {
        try {
            return await this.serviceProcessor.listService();
        }
        catch (error) {
            throw error;
        }
    };
    acknowledgeProviderSigner = async () => {
        try {
            return await this.serviceProcessor.acknowledgeProviderSigner();
        }
        catch (error) {
            throw error;
        }
    };
    uploadDataset = async (dataPath, isTurbo) => {
        try {
            return await this.modelProcessor.uploadDataset(this.signer.privateKey, dataPath, isTurbo);
        }
        catch (error) {
            throw error;
        }
    };
    createTask = async (pretrainedModelName, dataSize, rootHash, isTurbo, providerAddress, serviceName, trainingPath) => {
        try {
            return await this.serviceProcessor.createTask(pretrainedModelName, dataSize, rootHash, isTurbo, providerAddress, serviceName, trainingPath);
        }
        catch (error) {
            throw error;
        }
    };
    getTaskProgress = async (providerAddress, serviceName) => {
        try {
            return await this.serviceProcessor.getTaskProgress(providerAddress, serviceName, await this.signer.getAddress());
        }
        catch (error) {
            throw error;
        }
    };
    acknowledgeModel = async (providerAddress, serviceName, dataPath) => {
        try {
            return await this.modelProcessor.acknowledgeModel(providerAddress, serviceName, dataPath, await this.signer.getAddress());
        }
        catch (error) {
            throw error;
        }
    };
    decryptModel = async () => {
        try {
            return await this.modelProcessor.decryptModel();
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