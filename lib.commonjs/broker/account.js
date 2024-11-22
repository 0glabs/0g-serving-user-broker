"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountProcessor = void 0;
const base_1 = require("./base");
const settle_signer_1 = require("../settle-signer");
const utils_1 = require("../utils");
/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
class AccountProcessor extends base_1.ZGServingUserBrokerBase {
    async getAccount(provider) {
        try {
            const accounts = await this.contract.getAccount(provider);
            return accounts;
        }
        catch (error) {
            throw error;
        }
    }
    async listAccount() {
        try {
            const accounts = await this.contract.listAccount();
            return accounts;
        }
        catch (error) {
            throw error;
        }
    }
    async addAccount(providerAddress, balance) {
        try {
            try {
                const account = await this.getAccount(providerAddress);
                if (account) {
                    throw new Error('Account already exists, with balance: ' +
                        account.balance);
                }
            }
            catch (error) {
                if (!error.message.includes('AccountNotexists')) {
                    throw error;
                }
            }
            const { settleSignerPublicKey, settleSignerEncryptedPrivateKey } = await this.createSettleSignerKey(providerAddress);
            await this.contract.addAccount(providerAddress, settleSignerPublicKey, balance, settleSignerEncryptedPrivateKey);
        }
        catch (error) {
            throw error;
        }
    }
    async deleteAccount(provider) {
        try {
            await this.contract.deleteAccount(provider);
        }
        catch (error) {
            throw error;
        }
    }
    async depositFund(providerAddress, balance) {
        try {
            await this.contract.depositFund(providerAddress, balance);
        }
        catch (error) {
            throw error;
        }
    }
    async createSettleSignerKey(providerAddress) {
        try {
            // [pri, pub]
            const keyPair = await (0, settle_signer_1.genKeyPair)();
            const key = `${this.contract.getUserAddress()}_${providerAddress}`;
            this.metadata.storeSettleSignerPrivateKey(key, keyPair.packedPrivkey);
            const settleSignerEncryptedPrivateKey = await (0, utils_1.encryptData)(this.contract.signer, (0, utils_1.privateKeyToStr)(keyPair.packedPrivkey));
            return {
                settleSignerEncryptedPrivateKey,
                settleSignerPublicKey: keyPair.doublePackedPubkey,
            };
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AccountProcessor = AccountProcessor;
//# sourceMappingURL=account.js.map