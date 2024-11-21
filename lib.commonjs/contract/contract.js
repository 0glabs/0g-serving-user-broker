"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServingContract = void 0;
const serving_1 = require("./serving");
class ServingContract {
    serving;
    signer;
    _userAddress;
    constructor(signer, contractAddress, userAddress) {
        this.serving = serving_1.Serving__factory.connect(contractAddress, signer);
        this.signer = signer;
        this._userAddress = userAddress;
    }
    lockTime() {
        return this.serving.lockTime();
    }
    async listService() {
        try {
            const services = await this.serving.getAllServices();
            return services;
        }
        catch (error) {
            throw error;
        }
    }
    async listAccount() {
        try {
            const accounts = await this.serving.getAllAccounts();
            return accounts;
        }
        catch (error) {
            throw error;
        }
    }
    async getAccount(provider) {
        try {
            const user = this.getUserAddress();
            const account = await this.serving.getAccount(user, provider);
            return account;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteAccount(provider) {
        try {
            const tx = await this.serving.deleteAccount(provider);
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed');
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async addOrUpdateService(name, serviceType, url, model, verifiability, inputPrice, outputPrice) {
        try {
            const tx = await this.serving.addOrUpdateService(name, serviceType, url, model, verifiability, inputPrice, outputPrice);
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed');
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async addAccount(providerAddress, signer, balance, settleSignerEncryptedPrivateKey) {
        try {
            const tx = await this.serving.addAccount(providerAddress, signer, settleSignerEncryptedPrivateKey, {
                value: BigInt(balance),
            });
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed');
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async depositFund(providerAddress, balance) {
        try {
            const tx = await this.serving.depositFund(providerAddress, {
                value: balance,
            });
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed');
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async getService(providerAddress, svcName) {
        try {
            return this.serving.getService(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    }
    getUserAddress() {
        return this._userAddress;
    }
}
exports.ServingContract = ServingContract;
//# sourceMappingURL=contract.js.map