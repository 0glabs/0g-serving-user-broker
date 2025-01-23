"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerBroker = void 0;
exports.createLedgerBroker = createLedgerBroker;
const ethers_1 = require("ethers");
const ledger_1 = require("./ledger");
const contract_1 = require("./contract");
const storage_1 = require("../common/storage");
const contract_2 = require("../inference/contract");
const contract_3 = require("../fine-tuning/contract");
class LedgerBroker {
    ledger;
    signer;
    ledgerCA;
    inferenceCA;
    fineTuningCA;
    constructor(signer, ledgerCA, inferenceCA, fineTuningCA) {
        this.signer = signer;
        this.ledgerCA = ledgerCA;
        this.inferenceCA = inferenceCA;
        this.fineTuningCA = fineTuningCA;
    }
    async initialize() {
        let userAddress;
        try {
            userAddress = await this.signer.getAddress();
        }
        catch (error) {
            throw error;
        }
        const ledgerContract = new contract_1.LedgerManagerContract(this.signer, this.ledgerCA, userAddress);
        const inferenceContract = new contract_2.InferenceServingContract(this.signer, this.inferenceCA, userAddress);
        let fineTuningContract;
        if (this.signer instanceof ethers_1.Wallet) {
            fineTuningContract = new contract_3.FineTuningServingContract(this.signer, this.fineTuningCA, userAddress);
        }
        const metadata = new storage_1.Metadata();
        this.ledger = new ledger_1.LedgerProcessor(metadata, ledgerContract, inferenceContract, fineTuningContract);
    }
    /**
     * Adds a new ledger to the contract.
     *
     * @param {number} balance - The initial balance to be assigned to the new ledger. Units are in A0GI.
     *
     * @throws  An error if the ledger creation fails.
     *
     * @remarks
     * When creating an ledger, a key pair is also created to sign the request.
     */
    addLedger = async (balance) => {
        try {
            return await this.ledger.addLedger(balance);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Retrieves the ledger information for current wallet address.
     *
     * @returns A promise that resolves to the ledger information.
     *
     * @throws Will throw an error if the ledger retrieval process fails.
     */
    getLedger = async () => {
        try {
            return await this.ledger.getLedgerWithDetail();
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Deposits a specified amount of funds into Ledger corresponding to the current wallet address.
     *
     * @param {string} amount - The amount of funds to be deposited. Units are in A0GI.
     * @throws  An error if the deposit fails.
     */
    depositFund = async (amount) => {
        try {
            return await this.ledger.depositFund(amount);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Refunds a specified amount using the ledger.
     *
     * @param amount - The amount to be refunded.
     * @returns A promise that resolves when the refund is processed.
     * @throws Will throw an error if the refund process fails.
     *
     * @note The amount should be a positive number.
     */
    refund = async (amount) => {
        try {
            return await this.ledger.refund(amount);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Transfers a specified amount of funds to a provider for a given service type.
     *
     * @param provider - The address of the provider to whom the funds are being transferred.
     * @param serviceTypeStr - The type of service for which the funds are being transferred.
     *                         It can be either 'inference' or 'fine-tuning'.
     * @param amount - The amount of funds to be transferred. Units are in A0GI.
     * @returns A promise that resolves with the result of the fund transfer operation.
     * @throws Will throw an error if the fund transfer operation fails.
     */
    transferFund = async (provider, serviceTypeStr, amount) => {
        try {
            return await this.ledger.transferFund(provider, serviceTypeStr, amount);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Retrieves funds from the ledger for the specified providers and service type.
     *
     * @param providers - An array of addresses representing the providers.
     * @param serviceTypeStr - The type of service for which the funds are being retrieved.
     *                         It can be either 'inference' or 'fine-tuning'.
     * @returns A promise that resolves with the result of the fund retrieval operation.
     * @throws Will throw an error if the fund retrieval operation fails.
     */
    retrieveFund = async (providers, serviceTypeStr) => {
        try {
            return await this.ledger.retrieveFund(providers, serviceTypeStr);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Deletes the ledger corresponding to the current wallet address.
     *
     * @throws  An error if the deletion fails.
     */
    deleteLedger = async () => {
        try {
            return await this.ledger.deleteLedger();
        }
        catch (error) {
            throw error;
        }
    };
}
exports.LedgerBroker = LedgerBroker;
/**
 * createLedgerBroker is used to initialize LedgerBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - Ledger contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
async function createLedgerBroker(signer, ledgerCA, inferenceCA, fineTuningCA) {
    const broker = new LedgerBroker(signer, ledgerCA, inferenceCA, fineTuningCA);
    try {
        await broker.initialize();
        return broker;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=broker.js.map