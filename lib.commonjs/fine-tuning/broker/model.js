"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelProcessor = void 0;
const utils_1 = require("../../common/utils");
const const_1 = require("../const");
const zg_storage_1 = require("../zg-storage");
const base_1 = require("./base");
const token_1 = require("../token");
class ModelProcessor extends base_1.BrokerBase {
    async listModel() {
        const services = await this.contract.listService();
        let customizedModels = [];
        for (const service of services) {
            if (service.models.length !== 0) {
                const url = service.url;
                const models = await this.servingProvider.getCustomizedModels(url);
                for (const item of models) {
                    customizedModels.push([
                        item.name,
                        {
                            description: item.description,
                            provider: service.provider,
                        },
                    ]);
                }
            }
        }
        return [Object.entries(const_1.MODEL_HASH_MAP), customizedModels];
    }
    async uploadDataset(privateKey, dataPath, gasPrice, maxGasPrice) {
        await (0, zg_storage_1.upload)(privateKey, dataPath, gasPrice);
    }
    async calculateToken(datasetPath, usePython, preTrainedModelName, providerAddress) {
        let tokenizer;
        let dataType;
        if (preTrainedModelName in const_1.MODEL_HASH_MAP) {
            tokenizer = const_1.MODEL_HASH_MAP[preTrainedModelName].tokenizer;
            dataType = const_1.MODEL_HASH_MAP[preTrainedModelName].type;
        }
        else {
            if (providerAddress === undefined) {
                throw new Error('Provider address is required for customized model');
            }
            let model = await this.servingProvider.getCustomizedModel(providerAddress, preTrainedModelName);
            tokenizer = model.tokenizer;
            dataType = model.dataType;
        }
        let dataSize = 0;
        if (usePython) {
            dataSize = await (0, token_1.calculateTokenSizeViaPython)(tokenizer, datasetPath, dataType);
        }
        else {
            dataSize = await (0, token_1.calculateTokenSizeViaExe)(tokenizer, datasetPath, dataType, const_1.TOKEN_COUNTER_MERKLE_ROOT, const_1.TOKEN_COUNTER_FILE_HASH);
        }
        console.log(`The token size for the dataset ${datasetPath} is ${dataSize}`);
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
            (0, utils_1.throwFormattedError)(error);
        }
    }
    async decryptModel(providerAddress, encryptedModelPath, decryptedModelPath) {
        try {
            const account = await this.contract.getAccount(providerAddress);
            const latestDeliverable = account.deliverables[account.deliverables.length - 1];
            if (!latestDeliverable) {
                throw new Error('No deliverable found');
            }
            if (!latestDeliverable.acknowledged) {
                throw new Error('Deliverable not acknowledged yet');
            }
            if (!latestDeliverable.encryptedSecret) {
                throw new Error('EncryptedSecret not found');
            }
            const secret = await (0, utils_1.eciesDecrypt)(this.contract.signer, latestDeliverable.encryptedSecret);
            await (0, utils_1.aesGCMDecryptToFile)(secret, encryptedModelPath, decryptedModelPath, account.providerSigner);
        }
        catch (error) {
            (0, utils_1.throwFormattedError)(error);
        }
        return;
    }
}
exports.ModelProcessor = ModelProcessor;
//# sourceMappingURL=model.js.map