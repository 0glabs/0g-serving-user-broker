"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerProcessor = void 0;
const settle_signer_1 = require("../common/settle-signer");
const utils_1 = require("../common/utils");
/**
 * LedgerProcessor contains methods for creating, depositing funds, and retrieving 0G Compute Network Ledgers.
 */
class LedgerProcessor {
    metadata;
    ledgerContract;
    inferenceContract;
    fineTuningContract;
    constructor(metadata, ledgerContract, inferenceContract, fineTuningContract) {
        this.metadata = metadata;
        this.ledgerContract = ledgerContract;
        this.inferenceContract = inferenceContract;
        this.fineTuningContract = fineTuningContract;
    }
    async getLedger() {
        try {
            const ledger = await this.ledgerContract.getLedger();
            return ledger;
        }
        catch (error) {
            throw error;
        }
    }
    async getLedgerWithDetail() {
        try {
            const ledger = await this.ledgerContract.getLedger();
            const ledgerInfo = [
                this.neuronToA0gi(ledger.totalBalance).toFixed(18),
                this.neuronToA0gi(ledger.totalBalance - ledger.availableBalance).toFixed(18),
            ];
            const infers = await Promise.all(ledger.inferenceProviders.map(async (provider) => {
                const account = await this.inferenceContract.getAccount(provider);
                return [
                    provider,
                    this.neuronToA0gi(account.balance).toFixed(18),
                    this.neuronToA0gi(account.pendingRefund).toFixed(18),
                ];
            }));
            let fines = [];
            if (typeof ledger.fineTuningProviders !== 'undefined') {
                fines = await Promise.all(ledger.fineTuningProviders.map(async (provider) => {
                    const account = await this.fineTuningContract?.getAccount(provider);
                    return [
                        provider,
                        this.neuronToA0gi(account.balance).toFixed(18),
                        this.neuronToA0gi(account.pendingRefund).toFixed(18),
                    ];
                }));
            }
            return { ledgerInfo, infers, fines };
        }
        catch (error) {
            throw error;
        }
    }
    async listLedger() {
        try {
            const ledgers = await this.ledgerContract.listLedger();
            return ledgers;
        }
        catch (error) {
            throw error;
        }
    }
    async addLedger(balance) {
        try {
            try {
                const ledger = await this.getLedger();
                if (ledger) {
                    throw new Error('Ledger already exists, with balance: ' +
                        this.neuronToA0gi(ledger.totalBalance) +
                        ' A0GI');
                }
            }
            catch (error) {
                if (!error.message.includes('LedgerNotExists')) {
                    throw error;
                }
            }
            const { settleSignerPublicKey, settleSignerEncryptedPrivateKey } = await this.createSettleSignerKey();
            await this.ledgerContract.addLedger(settleSignerPublicKey, this.a0giToNeuron(balance), settleSignerEncryptedPrivateKey);
        }
        catch (error) {
            throw error;
        }
    }
    async deleteLedger() {
        try {
            await this.ledgerContract.deleteLedger();
        }
        catch (error) {
            throw error;
        }
    }
    async depositFund(balance) {
        try {
            const amount = this.a0giToNeuron(balance).toString();
            await this.ledgerContract.depositFund(amount);
        }
        catch (error) {
            throw error;
        }
    }
    async refund(balance) {
        try {
            const amount = this.a0giToNeuron(balance).toString();
            await this.ledgerContract.refund(amount);
        }
        catch (error) {
            throw error;
        }
    }
    async transferFund(to, serviceTypeStr, balance) {
        try {
            const amount = balance.toString();
            await this.ledgerContract.transferFund(to, serviceTypeStr, amount);
        }
        catch (error) {
            throw error;
        }
    }
    async retrieveFund(providers, serviceTypeStr) {
        try {
            await this.ledgerContract.retrieveFund(providers, serviceTypeStr);
        }
        catch (error) {
            throw error;
        }
    }
    async createSettleSignerKey() {
        try {
            // [pri, pub]
            const keyPair = await (0, settle_signer_1.genKeyPair)();
            const key = `${this.ledgerContract.getUserAddress()}`;
            this.metadata.storeSettleSignerPrivateKey(key, keyPair.packedPrivkey);
            const settleSignerEncryptedPrivateKey = await (0, utils_1.encryptData)(this.ledgerContract.signer, (0, utils_1.privateKeyToStr)(keyPair.packedPrivkey));
            return {
                settleSignerEncryptedPrivateKey,
                settleSignerPublicKey: keyPair.doublePackedPubkey,
            };
        }
        catch (error) {
            throw error;
        }
    }
    a0giToNeuron(value) {
        const valueStr = value.toFixed(18);
        const parts = valueStr.split('.');
        // Handle integer part
        const integerPart = parts[0];
        let integerPartAsBigInt = BigInt(integerPart) * BigInt(10 ** 18);
        // Handle fractional part if it exists
        if (parts.length > 1) {
            let fractionalPart = parts[1];
            while (fractionalPart.length < 18) {
                fractionalPart += '0';
            }
            if (fractionalPart.length > 18) {
                fractionalPart = fractionalPart.slice(0, 18); // Truncate to avoid overflow
            }
            const fractionalPartAsBigInt = BigInt(fractionalPart);
            integerPartAsBigInt += fractionalPartAsBigInt;
        }
        return integerPartAsBigInt;
    }
    neuronToA0gi(value) {
        const divisor = BigInt(10 ** 18);
        const integerPart = value / divisor;
        const remainder = value % divisor;
        const decimalPart = Number(remainder) / Number(divisor);
        return Number(integerPart) + decimalPart;
    }
}
exports.LedgerProcessor = LedgerProcessor;
//# sourceMappingURL=ledger.js.map