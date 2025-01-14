"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FineTuningBroker = void 0;
exports.createFineTuningBroker = createFineTuningBroker;
const fine_tuning_1 = require("../../contract/fine-tuning");
const model_1 = require("./model");
const service_1 = require("./service");
class FineTuningBroker {
    signer;
    fineTuningCA;
    ledger;
    modelProcessor;
    serviceProcessor;
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
        const contract = new fine_tuning_1.FineTuningServingContract(this.signer, this.fineTuningCA, userAddress);
        this.modelProcessor = new model_1.ModelProcessor(contract, this.ledger);
        this.serviceProcessor = new service_1.ServiceProcessor(contract, this.ledger);
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
    uploadDataset = async () => {
        try {
            return await this.modelProcessor.uploadDataset();
        }
        catch (error) {
            throw error;
        }
    };
    createTask = async () => {
        try {
            return await this.serviceProcessor.createTask();
        }
        catch (error) {
            throw error;
        }
    };
    getTaskProgress = async () => {
        try {
            return await this.serviceProcessor.getTaskProgress();
        }
        catch (error) {
            throw error;
        }
    };
    acknowledgeModel = async () => {
        try {
            return await this.modelProcessor.acknowledgeModel();
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