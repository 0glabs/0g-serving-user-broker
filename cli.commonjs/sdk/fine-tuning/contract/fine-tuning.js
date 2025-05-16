"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FineTuningServingContract = void 0;
const typechain_1 = require("./typechain");
const const_1 = require("../../common/utils/const");
const TIMEOUT_MS = 300_000;
class FineTuningServingContract {
    serving;
    signer;
    _userAddress;
    _gasPrice;
    _maxGasPrice;
    _step;
    constructor(signer, contractAddress, userAddress, gasPrice, maxGasPrice, step) {
        this.serving = typechain_1.FineTuningServing__factory.connect(contractAddress, signer);
        this.signer = signer;
        this._userAddress = userAddress;
        this._gasPrice = gasPrice;
        if (maxGasPrice) {
            this._maxGasPrice = BigInt(maxGasPrice);
        }
        this._step = step || 11;
    }
    lockTime() {
        return this.serving.lockTime();
    }
    async sendTx(name, txArgs, txOptions) {
        if (txOptions.gasPrice === undefined) {
            txOptions.gasPrice = (await this.signer.provider?.getFeeData())?.gasPrice;
        }
        else {
            txOptions.gasPrice = BigInt(txOptions.gasPrice);
        }
        const nonce = await this.signer.getNonce();
        const pendingNonce = await this.signer.provider?.getTransactionCount(this._userAddress, 'pending');
        if (pendingNonce !== undefined && pendingNonce - nonce > 5) {
            console.warn(`Significant gap detected between pending nonce (${pendingNonce}) and current nonce (${nonce}). This may indicate skipped or missing transactions. Using the current confirmed nonce for the transaction.`);
            txOptions.nonce = nonce;
        }
        while (true) {
            try {
                console.log('sending tx with gas price', txOptions.gasPrice);
                const tx = await this.serving.getFunction(name)(...txArgs, txOptions);
                console.log('tx hash:', tx.hash);
                const receipt = (await Promise.race([
                    tx.wait(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Get Receipt timeout, try set higher gas price')), TIMEOUT_MS)),
                ]));
                this.checkReceipt(receipt);
                break;
            }
            catch (error) {
                if (this._maxGasPrice === undefined) {
                    throw error;
                }
                let errorMessage = '';
                if (error.message) {
                    errorMessage = error.message;
                }
                else if (error.info?.error?.message) {
                    errorMessage = error.info.error.message;
                }
                const shouldRetry = const_1.RETRY_ERROR_SUBSTRINGS.some((substr) => errorMessage.includes(substr));
                if (!shouldRetry) {
                    throw error;
                }
                console.log('Retrying transaction with higher gas price due to:', errorMessage);
                let currentGasPrice = txOptions.gasPrice;
                if (currentGasPrice >= this._maxGasPrice) {
                    throw error;
                }
                currentGasPrice =
                    (currentGasPrice * BigInt(this._step)) / BigInt(10);
                if (currentGasPrice > this._maxGasPrice) {
                    currentGasPrice = this._maxGasPrice;
                }
                txOptions.gasPrice = currentGasPrice;
            }
        }
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
            await this.sendTx('acknowledgeProviderSigner', [providerAddress, providerSigner], txOptions);
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
            await this.sendTx('acknowledgeDeliverable', [providerAddress, index], txOptions);
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
    checkReceipt(receipt) {
        if (!receipt) {
            throw new Error('Transaction failed with no receipt');
        }
        if (receipt.status !== 1) {
            throw new Error('Transaction reverted');
        }
    }
}
exports.FineTuningServingContract = FineTuningServingContract;
//# sourceMappingURL=fine-tuning.js.map