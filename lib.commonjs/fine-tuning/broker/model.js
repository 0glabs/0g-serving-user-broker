"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProcessor = void 0;
const utils_1 = require("../../common/utils");
const const_1 = require("../const");
const zg_storage_1 = require("../zg-storage");
const base_1 = require("./base");
const fs_1 = require("fs");
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
            const latestDeliverable = account.deliverables[account.deliverables.length - 1];
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
    async decryptModel(providerAddress, encryptedModelPath, decryptedModelPath) {
        try {
            const account = await this.contract.getAccount(providerAddress);
            const latestDeliverable = account.deliverables[account.deliverables.length - 1];
            if (!latestDeliverable) {
                throw new Error('No deliverable found');
            }
            const secret = await (0, utils_1.eciesDecrypt)(this.contract.signer, latestDeliverable.encryptedSecret);
            const encryptedData = await fs_1.promises.readFile(encryptedModelPath);
            const model = await (0, utils_1.aesGCMDecrypt)(secret, encryptedData.toString('hex'), account.providerSigner);
            await fs_1.promises.writeFile(decryptedModelPath, model);
        }
        catch (error) {
            throw error;
        }
        return;
    }
}
exports.ModelProcessor = ModelProcessor;
//# sourceMappingURL=model.js.map