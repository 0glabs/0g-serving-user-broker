"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountProcessor = void 0;
const storage_1 = require("../storage");
const base_1 = require("./base");
const zk_1 = require("../zk");
/**
 * AccountProcessor 包含对 0G Serving Account 的创建，充值和获取的方法。
 */
class AccountProcessor extends base_1.ZGServingUserBrokerBase {
    async listService() {
        try {
            const services = await this.contract.listService();
            return services;
        }
        catch (error) {
            console.error('List Service Error:', error);
            throw error;
        }
    }
    async getAccount(user, provider) {
        try {
            const accounts = await this.contract.getAccount(user, provider);
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
    /**
     * addAccount 创建 0G Serving 账户。
     *
     * @param providerAddress - provider 地址。
     * @param balance - 账户预存金额。
     */
    async addAccount(providerAddress, balance) {
        let zkSignerPublicKey;
        try {
            zkSignerPublicKey = await this.createAndStoreKey(providerAddress);
        }
        catch (error) {
            throw error;
        }
        try {
            await this.contract.addAccount(providerAddress, zkSignerPublicKey, balance);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * depositFund 给 0G Serving 账户充值。
     *
     * @param providerAddress - provider 地址。
     * @param balance - 充值金额。
     */
    async depositFund(providerAddress, balance) {
        try {
            await this.contract.depositFund(providerAddress, balance);
        }
        catch (error) {
            throw error;
        }
    }
    async createAndStoreKey(providerAddress) {
        // [pri, pub]
        let keyPair;
        try {
            keyPair = await (0, zk_1.createKey)();
        }
        catch (error) {
            throw error;
        }
        const key = this.contract.getUserAddress() + providerAddress;
        // private key will be used for signing request
        storage_1.Metadata.storeZKPrivateKey(key, keyPair[0]);
        // public key will be used to create serving account
        return keyPair[1];
    }
}
exports.AccountProcessor = AccountProcessor;
//# sourceMappingURL=account.js.map