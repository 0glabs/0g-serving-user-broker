"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FineTuningServingContract = void 0;
const typechain_1 = require("./typechain");
class FineTuningServingContract {
    serving;
    signer;
    _userAddress;
    _gasPrice;
    constructor(signer, contractAddress, userAddress, gasPrice) {
        this.serving = typechain_1.FineTuningServing__factory.connect(contractAddress, signer);
        this.signer = signer;
        this._userAddress = userAddress;
        this._gasPrice = gasPrice;
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
    async acknowledgeProviderSigner(providerAddress, providerSigner, gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            const tx = await this.serving.acknowledgeProviderSigner(providerAddress, providerSigner, txOptions);
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
    async acknowledgeDeliverable(providerAddress, index, gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            const tx = await this.serving.acknowledgeDeliverable(providerAddress, index, txOptions);
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
    async getService(providerAddress) {
        try {
            return this.serving.getService(providerAddress);
        }
        catch (error) {
            throw error;
        }
    }
    async getDeliverable(providerAddress, index) {
        try {
            const user = this.getUserAddress();
            return this.serving.getDeliverable(user, providerAddress, index);
        }
        catch (error) {
            throw error;
        }
    }
    getUserAddress() {
        return this._userAddress;
    }
}
exports.FineTuningServingContract = FineTuningServingContract;
//# sourceMappingURL=fine-tuning.js.map