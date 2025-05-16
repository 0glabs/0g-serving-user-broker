"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerManagerContract = void 0;
const typechain_1 = require("./typechain");
const const_1 = require("../../common/utils/const");
const TIMEOUT_MS = 300_000;
class LedgerManagerContract {
    ledger;
    signer;
    _userAddress;
    _gasPrice;
    _maxGasPrice;
    _step;
    constructor(signer, contractAddress, userAddress, gasPrice, maxGasPrice, step) {
        this.ledger = typechain_1.LedgerManager__factory.connect(contractAddress, signer);
        this.signer = signer;
        this._userAddress = userAddress;
        this._gasPrice = gasPrice;
        this._maxGasPrice = maxGasPrice;
        this._step = step || 1.1;
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
                const tx = await this.ledger.getFunction(name)(...txArgs, txOptions);
                const receipt = (await Promise.race([
                    tx.wait(),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('Get Receipt timeout')), TIMEOUT_MS)),
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
    async addLedger(signer, balance, settleSignerEncryptedPrivateKey, gasPrice) {
        try {
            const txOptions = { value: balance };
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            await this.sendTx('addLedger', [signer, settleSignerEncryptedPrivateKey], txOptions);
        }
        catch (error) {
            throw error;
        }
    }
    async listLedger() {
        try {
            const ledgers = await this.ledger.getAllLedgers();
            return ledgers;
        }
        catch (error) {
            throw error;
        }
    }
    async getLedger() {
        try {
            const user = this.getUserAddress();
            const ledger = await this.ledger.getLedger(user);
            return ledger;
        }
        catch (error) {
            throw error;
        }
    }
    async depositFund(balance, gasPrice) {
        try {
            const txOptions = { value: balance };
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            await this.sendTx('depositFund', [], txOptions);
        }
        catch (error) {
            throw error;
        }
    }
    async refund(amount, gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            await this.sendTx('refund', [amount], txOptions);
        }
        catch (error) {
            throw error;
        }
    }
    async transferFund(provider, serviceTypeStr, amount, gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            await this.sendTx('transferFund', [provider, serviceTypeStr, amount], txOptions);
        }
        catch (error) {
            throw error;
        }
    }
    async retrieveFund(providers, serviceTypeStr, gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            await this.sendTx('retrieveFund', [providers, serviceTypeStr], txOptions);
        }
        catch (error) {
            throw error;
        }
    }
    async deleteLedger(gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            await this.sendTx('deleteLedger', [], txOptions);
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
exports.LedgerManagerContract = LedgerManagerContract;
//# sourceMappingURL=ledger.js.map