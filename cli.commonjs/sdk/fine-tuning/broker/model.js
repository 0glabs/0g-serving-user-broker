"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProcessor = void 0;
const utils_1 = require("../../common/utils");
const const_1 = require("../const");
const zg_storage_1 = require("../zg-storage");
const base_1 = require("./base");
const token_1 = require("../token");
class ModelProcessor extends base_1.BrokerBase {
    listModel() {
        return Object.entries(const_1.MODEL_HASH_MAP);
    }
    async uploadDataset(privateKey, dataPath, gasPrice, preTrainedModelName) {
        if (preTrainedModelName !== undefined && const_1.MODEL_HASH_MAP[preTrainedModelName].tokenizer !== undefined && const_1.MODEL_HASH_MAP[preTrainedModelName].tokenizer !== '') {
            let dataSize = await (0, token_1.calculateTokenSize)(const_1.MODEL_HASH_MAP[preTrainedModelName].tokenizer, dataPath, const_1.MODEL_HASH_MAP[preTrainedModelName].type);
            console.log(`The token size for the dataset ${dataPath} is ${dataSize}`);
        }
        await (0, zg_storage_1.upload)(privateKey, dataPath, gasPrice);
    }
    async downloadDataset(dataPath, dataRoot) {
        (0, zg_storage_1.download)(dataPath, dataRoot);
    }
    async acknowledgeModel(providerAddress, dataPath, gasPrice) {
        try {
            const account = await this.contract.getAccount(providerAddress);
            const latestDeliverable = account.deliverables[account.deliverables.length - 1];
            if (!latestDeliverable) {
                throw new Error('No deliverable found');
            }
            await (0, zg_storage_1.download)(dataPath, (0, utils_1.hexToRoots)(latestDeliverable.modelRootHash));
            await this.contract.acknowledgeDeliverable(providerAddress, account.deliverables.length - 1, gasPrice);
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
            await (0, utils_1.aesGCMDecryptToFile)(secret, encryptedModelPath, decryptedModelPath, account.providerSigner);
        }
        catch (error) {
            throw error;
        }
        return;
    }
}
exports.ModelProcessor = ModelProcessor;
//# sourceMappingURL=model.js.map