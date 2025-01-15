"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceProcessor = void 0;
const base_1 = require("./base");
class ServiceProcessor extends base_1.BrokerBase {
    // 4. list services
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
    //     2. [`TBD`] verify the quote using third party service (TODO: Jiahao discuss with Phala)
    //     3. [`call contract`] acknowledge the provider signer in contract
    async acknowledgeProviderSigner() {
        return;
    }
    // 7. create task
    //     1. get preTrained model root hash based on the model
    //     2. [`call contract`] calculate fee
    //     3. [`call contract`] transfer fund from ledger to fine-tuning provider
    //     4. [`call provider url/v1/task`]call provider task creation api to create task
    async createTask(pretrainedModelName, dataSize, rootHash, isTurbo, providerAddress, trainingParams) {
        const service = await this.contract.getService(providerAddress, pretrainedModelName);
        const fee = service.pricePerToken * BigInt(dataSize);
        await this.ledger.transferFund(providerAddress, "fine-tuning", fee);
        await this.servingProvider.createTask(pretrainedModelName, rootHash, isTurbo, providerAddress, fee.toString(), trainingParams);
    }
    // 8. [`call provider url/v1/task-progress`] call provider task progress api to get task progress
    async getTaskProgress(providerAddress, serviceName, customerAddress) {
        return await this.servingProvider.getTaskProgress(providerAddress, serviceName, customerAddress);
    }
}
exports.ServiceProcessor = ServiceProcessor;
//# sourceMappingURL=service.js.map