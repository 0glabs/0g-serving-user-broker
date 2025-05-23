"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestProcessor = void 0;
const base_1 = require("./base");
const storage_1 = require("../../common/storage");
const automata_1 = require("../../common/automata ");
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
class RequestProcessor extends base_1.ZGServingUserBrokerBase {
    automata;
    constructor(contract, metadata, cache, ledger) {
        super(contract, ledger, metadata, cache);
        this.automata = new automata_1.Automata();
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
    async acknowledgeProviderSigner(providerAddress, gasPrice) {
        try {
            try {
                await this.contract.getAccount(providerAddress);
            }
            catch (error) {
                if (!error.message.includes('AccountNotExists')) {
                    throw error;
                }
                else {
                    await this.ledger.transferFund(providerAddress, 'inference', BigInt(0), gasPrice);
                }
            }
            let { quote, provider_signer, key } = await this.getQuote(providerAddress);
            if (!quote || !provider_signer) {
                throw new Error('Invalid quote');
            }
            if (!quote.startsWith('0x')) {
                quote = '0x' + quote;
            }
            console.log(`provider signer ${provider_signer}`);
            const rpc = process.env.RPC_ENDPOINT;
            // bypass quote verification if testing on localhost
            if (!rpc || !/localhost|127\.0\.0\.1/.test(rpc)) {
                const isVerified = await this.automata.verifyQuote(quote);
                console.log('Quote verification:', isVerified);
                if (!isVerified) {
                    throw new Error('Quote verification failed');
                }
            }
            const account = await this.contract.getAccount(providerAddress);
            if (account.providerPubKey[0] === key[0] &&
                account.providerPubKey[1] === key[1]) {
                console.log('Provider signer already acknowledged');
                return;
            }
            await this.contract.acknowledgeProviderSigner(providerAddress, key);
            const userAddress = this.contract.getUserAddress();
            const cacheKey = `${userAddress}_${providerAddress}_ack`;
            await this.cache.setItem(cacheKey, key, 1 * 60 * 1000, storage_1.CacheValueTypeEnum.Other);
        }
        catch (error) {
            throw error;
        }
    }
    async getQuote(providerAddress) {
        try {
            const service = await this.getService(providerAddress);
            const url = service.url;
            const endpoint = `${url}/v1/quote`;
            const quoteString = await this.fetchText(endpoint, {
                method: 'GET',
            });
            const ret = JSON.parse(quoteString, (_, value) => {
                if (typeof value === 'string' && /^\d+$/.test(value)) {
                    return BigInt(value);
                }
                return value;
            });
            return ret;
        }
        catch (error) {
            throw error;
        }
    }
    async fetchText(endpoint, options) {
        try {
            const response = await fetch(endpoint, options);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const buffer = await response.arrayBuffer();
            return Buffer.from(buffer).toString('utf-8');
        }
        catch (error) {
            throw error;
        }
    }
}
exports.RequestProcessor = RequestProcessor;
//# sourceMappingURL=request.js.map