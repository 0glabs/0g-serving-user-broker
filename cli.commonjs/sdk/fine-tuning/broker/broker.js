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
    _gasPrice;
    _maxGasPrice;
    _step;
    constructor(signer, fineTuningCA, ledger, gasPrice, maxGasPrice, step) {
        this.signer = signer;
        this.fineTuningCA = fineTuningCA;
        this.ledger = ledger;
        this._gasPrice = gasPrice;
        this._maxGasPrice = maxGasPrice;
        this._step = step;
    }
    async initialize() {
        let userAddress;
        try {
            userAddress = await this.signer.getAddress();
        }
        catch (error) {
            throw error;
        }
        const contract = new contract_1.FineTuningServingContract(this.signer, this.fineTuningCA, userAddress, this._gasPrice, this._maxGasPrice, this._step);
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
    getLockedTime = async () => {
        try {
            return await this.serviceProcessor.getLockTime();
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
    getAccountWithDetail = async (providerAddress) => {
        try {
            return await this.serviceProcessor.getAccountWithDetail(providerAddress);
        }
        catch (error) {
            throw error;
        }
    };
    acknowledgeProviderSigner = async (providerAddress, gasPrice) => {
        try {
            return await this.serviceProcessor.acknowledgeProviderSigner(providerAddress, gasPrice);
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
    uploadDataset = async (dataPath, gasPrice, maxGasPrice) => {
        try {
            await this.modelProcessor.uploadDataset(this.signer.privateKey, dataPath, gasPrice || this._gasPrice, maxGasPrice || this._maxGasPrice);
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
    calculateToken = async (datasetPath, preTrainedModelName, usePython, providerAddress) => {
        try {
            await this.modelProcessor.calculateToken(datasetPath, usePython, preTrainedModelName, providerAddress);
        }
        catch (error) {
            throw error;
        }
    };
    createTask = async (providerAddress, preTrainedModelName, dataSize, datasetHash, trainingPath, gasPrice) => {
        try {
            return await this.serviceProcessor.createTask(providerAddress, preTrainedModelName, dataSize, datasetHash, trainingPath, gasPrice);
        }
        catch (error) {
            throw error;
        }
    };
    listTask = async (providerAddress) => {
        try {
            return await this.serviceProcessor.listTask(providerAddress);
        }
        catch (error) {
            throw error;
        }
    };
    getTask = async (providerAddress, taskID) => {
        try {
            const task = await this.serviceProcessor.getTask(providerAddress, taskID);
            return task;
        }
        catch (error) {
            throw error;
        }
    };
    getLog = async (providerAddress, taskID) => {
        try {
            return await this.serviceProcessor.getLog(providerAddress, taskID);
        }
        catch (error) {
            throw error;
        }
    };
    acknowledgeModel = async (providerAddress, dataPath, gasPrice) => {
        try {
            return await this.modelProcessor.acknowledgeModel(providerAddress, dataPath, gasPrice);
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
 * @param ledger - Ledger broker instance.
 * @param gasPrice - Gas price for transactions. If not provided, the gas price will be calculated automatically.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
async function createFineTuningBroker(signer, contractAddress, ledger, gasPrice, maxGasPrice, step) {
    const broker = new FineTuningBroker(signer, contractAddress, ledger, gasPrice, maxGasPrice, step);
    try {
        await broker.initialize();
        return broker;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=broker.js.map