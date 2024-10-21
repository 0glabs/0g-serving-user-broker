import { Cache, CacheValueTypeEnum, Metadata } from '../storage';
import { ChatBot } from '../extractor';
export class ZGServingUserBrokerBase {
    contract;
    config;
    constructor(contract, config) {
        this.contract = contract;
        this.config = config;
    }
    async getProviderData(providerAddress) {
        const key = this.contract.getUserAddress() + providerAddress;
        const [nonce, outputFee, zkPrivateKey] = await Promise.all([
            Metadata.getNonce(key),
            Metadata.getOutputFee(key),
            Metadata.getZKPrivateKey(key),
        ]);
        return { nonce, outputFee, zkPrivateKey };
    }
    async getService(providerAddress, svcName, useCache = true) {
        const key = providerAddress + svcName;
        const cachedSvc = Cache.getItem(key);
        if (cachedSvc && useCache) {
            return cachedSvc;
        }
        try {
            const svc = await this.contract.getService(providerAddress, svcName);
            Cache.setItem(key, svc, 5 * 60 * 1000, CacheValueTypeEnum.Service);
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
                return new ChatBot(svc);
            default:
                throw new Error('Unknown service type');
        }
    }
}
//# sourceMappingURL=base.js.map