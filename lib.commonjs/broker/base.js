"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZGServingUserBrokerBase = void 0;
const storage_1 = require("../storage");
const extractor_1 = require("../extractor");
const utils_1 = require("../utils");
const settle_signer_1 = require("../settle-signer");
class ZGServingUserBrokerBase {
    contract;
    metadata;
    cache;
    constructor(contract, metadata, cache) {
        this.contract = contract;
        this.metadata = metadata;
        this.cache = cache;
    }
    async getProviderData(providerAddress) {
        const key = `${this.contract.getUserAddress()}_${providerAddress}`;
        const [settleSignerPrivateKey] = await Promise.all([
            this.metadata.getSettleSignerPrivateKey(key),
        ]);
        return { settleSignerPrivateKey };
    }
    async getService(providerAddress, svcName, useCache = true) {
        const key = providerAddress + svcName;
        const cachedSvc = await this.cache.getItem(key);
        if (cachedSvc && useCache) {
            return cachedSvc;
        }
        try {
            const svc = await this.contract.getService(providerAddress, svcName);
            await this.cache.setItem(key, svc, 1 * 60 * 1000, storage_1.CacheValueTypeEnum.Service);
            return svc;
        }
        catch (error) {
            throw error;
        }
    }
    async getExtractor(providerAddress, svcName, useCache = true) {
        try {
            const svc = await this.getService(providerAddress, svcName, useCache);
            const extractor = this.createExtractor(svc);
            return extractor;
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
    async getHeader(providerAddress, svcName, content, outputFee) {
        try {
            const extractor = await this.getExtractor(providerAddress, svcName);
            const { settleSignerPrivateKey } = await this.getProviderData(providerAddress);
            const key = `${this.contract.getUserAddress()}_${providerAddress}`;
            let privateKey = settleSignerPrivateKey;
            if (!privateKey) {
                const account = await this.contract.getAccount(providerAddress);
                const privateKeyStr = await (0, utils_1.decryptData)(this.contract.signer, account.additionalInfo);
                privateKey = (0, utils_1.strToPrivateKey)(privateKeyStr);
                this.metadata.storeSettleSignerPrivateKey(key, privateKey);
            }
            const nonce = (0, utils_1.getNonce)();
            const inputFee = await this.calculateInputFees(extractor, content);
            const fee = inputFee + outputFee;
            const request = new settle_signer_1.Request(nonce.toString(), fee.toString(), this.contract.getUserAddress(), providerAddress);
            const settleSignature = await (0, settle_signer_1.signData)([request], privateKey);
            const sig = JSON.stringify(Array.from(settleSignature[0]));
            return {
                'X-Phala-Signature-Type': 'StandaloneApi',
                Address: this.contract.getUserAddress(),
                Fee: fee.toString(),
                'Input-Fee': inputFee.toString(),
                Nonce: nonce.toString(),
                'Previous-Output-Fee': outputFee.toString(),
                'Service-Name': svcName,
                Signature: sig,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async calculateInputFees(extractor, content) {
        const svc = await extractor.getSvcInfo();
        const inputCount = await extractor.getInputCount(content);
        const inputFee = BigInt(inputCount) * svc.inputPrice;
        return inputFee;
    }
}
exports.ZGServingUserBrokerBase = ZGServingUserBrokerBase;
//# sourceMappingURL=base.js.map