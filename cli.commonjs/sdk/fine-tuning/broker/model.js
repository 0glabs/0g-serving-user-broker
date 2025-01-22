"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProcessor = void 0;
const const_1 = require("../const");
const zg_storage_1 = require("../zg-storage");
const base_1 = require("./base");
class ModelProcessor extends base_1.BrokerBase {
    listModel() {
        return Object.keys(const_1.MODEL_HASH_MAP);
    }
    async uploadDataset(privateKey, dataPath) {
        (0, zg_storage_1.upload)(privateKey, dataPath);
    }
    async downloadDataset(dataPath, dataRoot) {
        (0, zg_storage_1.download)(dataPath, dataRoot);
    }
    async acknowledgeModel(providerAddress, dataPath) {
        try {
            const account = await this.contract.getAccount(providerAddress);
            const latestDeliverable = account.deliverables[-1];
            if (!latestDeliverable) {
                throw new Error('No deliverable found');
            }
            await (0, zg_storage_1.download)(dataPath, latestDeliverable.modelRootHash);
            await this.contract.acknowledgeDeliverable(providerAddress, account.deliverables.length - 1);
        }
        catch (error) {
            throw error;
        }
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