"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerProcessor = void 0;
const settle_signer_1 = require("../common/settle-signer");
const utils_1 = require("../common/utils");
const storage_1 = require("../common/storage");
/**
 * LedgerProcessor contains methods for creating, depositing funds, and retrieving 0G Compute Network Ledgers.
 */
class LedgerProcessor {
    metadata;
    cache;
    ledgerContract;
    inferenceContract;
    fineTuningContract;
    constructor(metadata, cache, ledgerContract, inferenceContract, fineTuningContract) {
        this.metadata = metadata;
        this.ledgerContract = ledgerContract;
        this.inferenceContract = inferenceContract;
        this.fineTuningContract = fineTuningContract;
        this.cache = cache;
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
                ledger.totalBalance,
                ledger.totalBalance - ledger.availableBalance,
            ];
            const infers = await Promise.all(ledger.inferenceProviders.map(async (provider) => {
                const account = await this.inferenceContract.getAccount(provider);
                return [provider, account.balance, account.pendingRefund];
            }));
            if (typeof this.fineTuningContract == 'undefined') {
                return { ledgerInfo, infers, fines: [] };
            }
            const fines = await Promise.all(ledger.fineTuningProviders.map(async (provider) => {
                const account = await this.fineTuningContract?.getAccount(provider);
                return [provider, account.balance, account.pendingRefund];
            }));
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
    async addLedger(balance, gasPrice) {
        try {
            try {
                const ledger = await this.getLedger();
                if (ledger) {
                    throw new Error('Ledger already exists, with balance: ' +
                        this.neuronToA0gi(ledger.totalBalance) +
                        ' A0GI');
                }
            }
            catch (error) { }
            const { settleSignerPublicKey, settleSignerEncryptedPrivateKey } = await this.createSettleSignerKey();
            console.log(`Creating ledger with settle signer public key: ${settleSignerPublicKey} and encrypted private key: ${settleSignerEncryptedPrivateKey}`);
            await this.ledgerContract.addLedger(settleSignerPublicKey, this.a0giToNeuron(balance), settleSignerEncryptedPrivateKey, gasPrice);
        }
        catch (error) {
            throw error;
        }
    }
    async deleteLedger(gasPrice) {
        try {
            await this.ledgerContract.deleteLedger(gasPrice);
        }
        catch (error) {
            throw error;
        }
    }
    async depositFund(balance, gasPrice) {
        try {
            const amount = this.a0giToNeuron(balance).toString();
            await this.ledgerContract.depositFund(amount, gasPrice);
        }
        catch (error) {
            throw error;
        }
    }
    async refund(balance, gasPrice) {
        try {
            const amount = this.a0giToNeuron(balance).toString();
            await this.ledgerContract.refund(amount, gasPrice);
        }
        catch (error) {
            throw error;
        }
    }
    async transferFund(to, serviceTypeStr, balance, gasPrice) {
        try {
            const amount = balance.toString();
            await this.ledgerContract.transferFund(to, serviceTypeStr, amount, gasPrice);
        }
        catch (error) {
            throw error;
        }
    }
    async retrieveFund(serviceTypeStr, gasPrice) {
        try {
            const ledger = await this.getLedgerWithDetail();
            const providers = serviceTypeStr == 'inference' ? ledger.infers : ledger.fines;
            if (!providers) {
                throw new Error('No providers found, please ensure you are using Wallet instance to create the broker');
            }
            const providerAddresses = providers
                .filter((x) => x[1] - x[2] > 0n)
                .map((x) => x[0]);
            await this.ledgerContract.retrieveFund(providerAddresses, serviceTypeStr, gasPrice);
            if (serviceTypeStr == 'inference') {
                await this.cache.setItem('firstRound', 'true', 10000000 * 60 * 1000, storage_1.CacheValueTypeEnum.Other);
            }
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