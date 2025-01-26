"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestProcessor = void 0;
const base_1 = require("./base");
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
class RequestProcessor extends base_1.ZGServingUserBrokerBase {
    checkAccountThreshold = BigInt(1000);
    topUpTriggerThreshold = BigInt(5000);
    topUpTargetThreshold = BigInt(10000);
    ledger;
    constructor(contract, metadata, cache, ledger) {
        super(contract, metadata, cache);
        this.ledger = ledger;
    }
    async getServiceMetadata(providerAddress, svcName) {
        const service = await this.getService(providerAddress, svcName);
        return {
            endpoint: `${service.url}/v1/proxy/${svcName}`,
            model: service.model,
        };
    }
    async getRequestHeaders(providerAddress, svcName, content) {
        try {
            await this.topUpAccountIfNeeded(providerAddress, svcName, content);
            return await this.getHeader(providerAddress, svcName, content, BigInt(0));
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Check the cache fund for this provider, return true if the fund is above 1000 * (inputPrice + outputPrice)
     * @param provider
     * @param svc
     */
    async checkCachedFee(key, svc) {
        try {
            const usedFund = (await this.cache.getItem(key)) || BigInt(0);
            return (usedFund >
                this.checkAccountThreshold * (svc.inputPrice + svc.outputPrice));
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Transfer fund from ledger if fund in the inference account is less than a 5000 * (inputPrice + outputPrice)
     * @param provider
     * @param svcName
     */
    async topUpAccountIfNeeded(provider, svcName, content) {
        try {
            const extractor = await this.getExtractor(provider, svcName);
            const svc = await extractor.getSvcInfo();
            const key = this.getCachedFeeKey(provider, svcName);
            const needCheck = await this.checkCachedFee(key, svc);
            // update cache for current content
            const newFee = await this.calculateInputFees(extractor, content);
            await this.updateCachedFee(provider, svcName, newFee);
            if (!needCheck) {
                return;
            }
            // check fund in account
            const acc = await this.contract.getAccount(provider);
            if (acc.balance <
                this.topUpTriggerThreshold * (svc.inputPrice + svc.outputPrice)) {
                await this.ledger.transferFund(provider, 'inference', this.topUpTargetThreshold *
                    (svc.inputPrice + svc.outputPrice));
            }
        }
        catch (error) {
            throw error;
        }
    }
}
exports.RequestProcessor = RequestProcessor;
//# sourceMappingURL=request.js.map