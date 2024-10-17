"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZGServingUserBrokerBase = void 0;
const storage_1 = require("../storage");
const extractor_1 = require("../extractor");
class ZGServingUserBrokerBase {
    contract;
    config;
    constructor(contract, config) {
        this.contract = contract;
        this.config = config;
    }
    async getProviderData(providerAddress) {
        const [nonce, outputFee, privateKey] = await Promise.all([
            storage_1.Metadata.getNonce(providerAddress),
            storage_1.Metadata.getOutputFee(providerAddress),
            storage_1.Metadata.getPrivateKey(providerAddress),
        ]);
        return { nonce, outputFee, privateKey };
    }
    async getService(providerAddress, svcName, useCache = true) {
        const key = providerAddress + svcName;
        const cachedSvc = storage_1.Cache.getItem(key);
        if (cachedSvc && useCache) {
            return cachedSvc;
        }
        try {
            const svc = await this.contract.getService(providerAddress, svcName);
            storage_1.Cache.setItem(key, svc, 5 * 60 * 1000, storage_1.CacheValueTypeEnum.Service);
            return svc;
        }
        catch (error) {
            throw error;
        }
    }
    async getExtractor(providerAddress, svcName, useCache = true) {
        try {
            const svc = await this.getService(providerAddress, svcName, useCache);
            return this.createExtractor(svc);
        }
        catch (error) {
            throw error;
        }
    }
    createExtractor(svc) {
        switch (svc.serviceType) {
            case 'chatbot':
                return new extractor_1.ChatBot(svc);
            default:
                throw new Error('Unknown service type');
        }
    }
}
exports.ZGServingUserBrokerBase = ZGServingUserBrokerBase;
//# sourceMappingURL=base.js.map