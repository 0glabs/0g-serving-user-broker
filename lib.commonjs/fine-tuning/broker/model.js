"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProcessor = void 0;
const base_1 = require("./base");
class ModelProcessor extends base_1.BrokerBase {
    // 6. [`use 0g storage sdk`] upload dataset, get dataset root hash
    async uploadDataset(privateKey, dataPath, isTurbo) {
        return this.zgClient.upload(privateKey, dataPath, isTurbo);
    }
    // 9. acknowledge encrypted model with root hash
    //     1. [`call contract`] get deliverable with root hash
    //     2. [`use 0g storage sdk`] download model, calculate root hash, compare with provided root hash
    //     3. [`call contract`] acknowledge the model in contract
    async acknowledgeModel(providerAddress, serviceName, dataPath, customerAddress) {
        const account = await this.contract.getAccount(providerAddress);
        const latestDeliverable = account.deliverables[-1];
        const task = await this.servingProvider.getLatestTask(providerAddress, serviceName, customerAddress);
        await this.zgClient.download(dataPath, latestDeliverable.modelRootHash, task.isTurbo);
        await this.contract.acknowledgeDeliverable(providerAddress, account.deliverables.length - 1);
    }
    // 10. decrypt model
    //     1. [`call contract`] get deliverable with encryptedSecret
    //     2. decrypt the encryptedSecret
    //     3. decrypt model with secret [TODO: Discuss LiuYuan]
    async decryptModel() {
        return;
    }
}
exports.ModelProcessor = ModelProcessor;
//# sourceMappingURL=model.js.map