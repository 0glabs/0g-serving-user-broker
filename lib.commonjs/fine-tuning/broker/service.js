"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProcessor = void 0;
const tslib_1 = require("tslib");
const utils_1 = require("../../common/utils");
const const_1 = require("../const");
const base_1 = require("./base");
const fs = tslib_1.__importStar(require("fs/promises"));
class ServiceProcessor extends base_1.BrokerBase {
    async getAccount(provider) {
        try {
            const account = await this.contract.getAccount(provider);
            return account;
        }
        catch (error) {
            throw error;
        }
    }
    async listService() {
        try {
            const services = await this.contract.listService();
            return services;
        }
        catch (error) {
            throw error;
        }
    }
    // 5. acknowledge provider signer
    //     1. [`call provider url/v1/quote`] call provider quote api to download quote (contains provider signer)
    //     2. [`TBD`] verify the quote using third party service (TODO: discuss with Phala)
    //     3. [`call contract`] acknowledge the provider signer in contract
    async acknowledgeProviderSigner(providerAddress, svcName) {
        try {
            try {
                await this.contract.getAccount(providerAddress);
            }
            catch (error) {
                if (!error.message.includes('AccountNotExists')) {
                    throw error;
                }
                else {
                    await this.ledger.transferFund(providerAddress, 'fine-tuning', BigInt(0));
                }
            }
            const res = await this.servingProvider.getQuote(providerAddress, svcName);
            // TODO: verify the quote
            await this.contract.acknowledgeProviderSigner(providerAddress, res.provider_signer);
        }
        catch (error) {
            throw error;
        }
    }
    // 7. create task
    //     1. get preTrained model root hash based on the model
    //     2. [`call contract`] calculate fee
    //     3. [`call contract`] transfer fund from ledger to fine-tuning provider
    //     4. [`call provider url/v1/task`]call provider task creation api to create task
    async createTask(providerAddress, serviceName, preTrainedModelName, dataSize, datasetHash, trainingPath) {
        try {
            const service = await this.contract.getService(providerAddress, serviceName);
            const fee = service.pricePerToken * BigInt(dataSize);
            await this.ledger.transferFund(providerAddress, 'fine-tuning', fee);
            const trainingParams = await fs.readFile(trainingPath, 'utf-8');
            this.verifyTrainingParams(trainingParams);
            const nonce = (0, utils_1.getNonce)();
            const signature = await (0, utils_1.signRequest)(this.contract.signer, this.contract.getUserAddress(), BigInt(nonce), datasetHash, fee);
            const task = {
                userAddress: this.contract.getUserAddress(),
                serviceName,
                datasetHash,
                trainingParams,
                preTrainedModelHash: const_1.MODEL_HASH_MAP[preTrainedModelName].turbo,
                fee: fee.toString(),
                nonce: nonce.toString(),
                signature,
            };
            return await this.servingProvider.createTask(providerAddress, task);
        }
        catch (error) {
            throw error;
        }
    }
    // 8. [`call provider`] call provider task progress api to get task progress
    async getLog(providerAddress, serviceName, taskID) {
        if (!taskID) {
            const tasks = await this.servingProvider.listTask(providerAddress, serviceName, this.contract.getUserAddress(), true);
            taskID = tasks[0].id;
            if (tasks.length === 0 || !taskID) {
                throw new Error('No task found');
            }
        }
        return this.servingProvider.getLog(providerAddress, serviceName, this.contract.getUserAddress(), taskID);
    }
    verifyTrainingParams(trainingParams) {
        try {
            JSON.parse(trainingParams);
        }
        catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
            throw new Error(`Invalid JSON in trainingPath file: ${errorMessage}`);
        }
    }
}
exports.ServiceProcessor = ServiceProcessor;
//# sourceMappingURL=service.js.map