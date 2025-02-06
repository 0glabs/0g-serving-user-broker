"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestProcessor = void 0;
const base_1 = require("./base");
const storage_1 = require("../storage");
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
    async getServiceMetadata(providerAddress) {
        const service = await this.getService(providerAddress);
        return {
            endpoint: `${service.url}/v1/proxy`,
            model: service.model,
        };
    }
    /*
     * 1. To Ensure No Insufficient Balance Occurs.
     *
     * The provider settles accounts regularly. In addition, we will add a rule to the provider's settlement logic:
     * if the actual balance of the customer's account is less than 5000, settlement will be triggered immediately.
     * The actual balance is defined as the customer's inference account balance minus any unsettled amounts.
     *
     * This way, if the customer checks their account and sees a balance greater than 5000, even if the provider settles
     * immediately, the deduction will leave about 5000, ensuring that no insufficient balance situation occurs.
     *
     * 2. To Avoid Frequent Transfers
     *
     * On the customer's side, if the balance falls below 5000, it should be topped up to 10000. This is to avoid frequent
     * transfers.
     *
     * 3. To Avoid Having to Check the Balance on Every Customer Request
     *
     * Record expenditures in processResponse and maintain a total consumption amount. Every time the total expenditure
     * reaches 1000, recheck the balance and perform a transfer if necessary.
     *
     * ps: The units for 5000 and 1000 can be (service.inputPricePerToken + service.outputPricePerToken).
     */
    async getRequestHeaders(providerAddress, content) {
        try {
            await this.topUpAccountIfNeeded(providerAddress, content);
            return await this.getHeader(providerAddress, content, BigInt(0));
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
    async shouldCheckAccount(svc) {
        try {
            const key = svc.provider + '_cachedFee';
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
     */
    async topUpAccountIfNeeded(provider, content, gasPrice) {
        try {
            const extractor = await this.getExtractor(provider);
            const svc = await extractor.getSvcInfo();
            // In first around, we top up the account to topUpTargetThreshold * (inputPrice + outputPrice).
            // Then the account will be maintained by the checkAccountThreshold.
            const firstRound = await this.cache.getItem('firstRound');
            if (firstRound !== 'false') {
                await this.ledger.transferFund(provider, 'inference', this.topUpTargetThreshold *
                    (svc.inputPrice + svc.outputPrice), gasPrice);
                await this.cache.setItem('firstRound', 'false', 10000000 * 60 * 1000, storage_1.CacheValueTypeEnum.Other);
                return;
            }
            const newFee = await this.calculateInputFees(extractor, content);
            await this.updateCachedFee(provider, newFee);
            const needCheck = await this.shouldCheckAccount(svc);
            // update cache for current content
            if (!needCheck) {
                return;
            }
            // check fund in account
            const acc = await this.contract.getAccount(provider);
            if (acc.balance <
                this.topUpTriggerThreshold * (svc.inputPrice + svc.outputPrice)) {
                await this.ledger.transferFund(provider, 'inference', this.topUpTargetThreshold *
                    (svc.inputPrice + svc.outputPrice), gasPrice);
            }
            await this.clearCacheFee(provider, newFee);
        }
        catch (error) {
            throw error;
        }
    }
}
exports.RequestProcessor = RequestProcessor;
//# sourceMappingURL=request.js.map