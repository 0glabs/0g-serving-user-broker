"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerManagerContract = void 0;
const typechain_1 = require("./typechain");
class LedgerManagerContract {
    ledger;
    signer;
    _userAddress;
    _gasPrice;
    constructor(signer, contractAddress, userAddress, gasPrice) {
        this.ledger = typechain_1.LedgerManager__factory.connect(contractAddress, signer);
        this.signer = signer;
        this._userAddress = userAddress;
        this._gasPrice = gasPrice;
    }
    async addLedger(signer, balance, settleSignerEncryptedPrivateKey, gasPrice) {
        try {
            const txOptions = { value: balance };
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            const tx = await this.ledger.addLedger(signer, settleSignerEncryptedPrivateKey, txOptions);
            const receipt = await tx.wait();
            this.checkReceipt(receipt);
        }
        catch (error) {
            this.detailedError(error);
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
            const tx = await this.ledger.depositFund(txOptions);
            const receipt = await tx.wait();
            this.checkReceipt(receipt);
        }
        catch (error) {
            this.detailedError(error);
        }
    }
    async refund(amount, gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            const tx = await this.ledger.refund(amount, txOptions);
            const receipt = await tx.wait();
            this.checkReceipt(receipt);
        }
        catch (error) {
            this.detailedError(error);
        }
    }
    async transferFund(provider, serviceTypeStr, amount, gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            const tx = await this.ledger.transferFund(provider, serviceTypeStr, amount, txOptions);
            const receipt = await tx.wait();
            this.checkReceipt(receipt);
        }
        catch (error) {
            this.detailedError(error);
        }
    }
    async retrieveFund(providers, serviceTypeStr, gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            const tx = await this.ledger.retrieveFund(providers, serviceTypeStr, txOptions);
            const receipt = await tx.wait();
            this.checkReceipt(receipt);
        }
        catch (error) {
            this.detailedError(error);
        }
    }
    async deleteLedger(gasPrice) {
        try {
            const txOptions = {};
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice;
            }
            const tx = await this.ledger.deleteLedger(txOptions);
            const receipt = await tx.wait();
            this.checkReceipt(receipt);
        }
        catch (error) {
            this.detailedError(error);
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
    detailedError(error) {
        if (error.raw_log) {
            throw new Error('Transaction reverted: ' + error.raw_log);
        }
        else if (error.logs) {
            // append log together
            let log = '';
            error.logs.forEach((l) => {
                log += l.log;
            });
            throw new Error('Transaction reverted: ' + log);
        }
        else if (error.log) {
            throw new Error('Transaction reverted: ' + error.log);
        }
        else if (error.info?.error?.message) {
            throw new Error('Transaction reverted: ' + error.info.error.message);
        }
        throw error;
    }
}
exports.LedgerManagerContract = LedgerManagerContract;
//# sourceMappingURL=ledger.js.map