"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerManagerContract = void 0;
const typechain_1 = require("./typechain");
class LedgerManagerContract {
    ledger;
    signer;
    _userAddress;
    constructor(signer, contractAddress, userAddress) {
        this.ledger = typechain_1.LedgerManager__factory.connect(contractAddress, signer);
        this.signer = signer;
        this._userAddress = userAddress;
    }
    async addLedger(signer, balance, settleSignerEncryptedPrivateKey) {
        try {
            const tx = await this.ledger.addLedger(signer, settleSignerEncryptedPrivateKey, {
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
    async depositFund(balance) {
        try {
            const tx = await this.ledger.depositFund({
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
    async refund(amount) {
        try {
            const tx = await this.ledger.refund(amount);
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
    async transferFund(provider, serviceTypeStr, amount) {
        try {
            const tx = await this.ledger.transferFund(provider, serviceTypeStr, amount);
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
    async retrieveFund(providers, serviceTypeStr) {
        try {
            const tx = await this.ledger.retrieveFund(providers, serviceTypeStr);
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
    async deleteLedger() {
        try {
            const tx = await this.ledger.deleteLedger();
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
    getUserAddress() {
        return this._userAddress;
    }
}
exports.LedgerManagerContract = LedgerManagerContract;
//# sourceMappingURL=ledger.js.map