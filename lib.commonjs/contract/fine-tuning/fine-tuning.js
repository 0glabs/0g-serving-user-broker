"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FineTuningServingContract = void 0;
const typechain_1 = require("./typechain");
class FineTuningServingContract {
    serving;
    signer;
    _userAddress;
    constructor(signer, contractAddress, userAddress) {
        this.serving = typechain_1.FineTuningServing__factory.connect(contractAddress, signer);
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
    async acknowledgeProviderSigner(providerAddress, providerSigner) {
        try {
            const tx = await this.serving.acknowledgeProviderSigner(providerAddress, providerSigner);
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
    async acknowledgeDeliverable(providerAddress, index) {
        try {
            const tx = await this.serving.acknowledgeDeliverable(providerAddress, index);
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
exports.FineTuningServingContract = FineTuningServingContract;
//# sourceMappingURL=fine-tuning.js.map