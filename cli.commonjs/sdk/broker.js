"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZGComputeNetworkBroker = void 0;
exports.createZGComputeNetworkBroker = createZGComputeNetworkBroker;
const ethers_1 = require("ethers");
const ledger_1 = require("./ledger");
const broker_1 = require("./fine-tuning/broker");
const broker_2 = require("./inference/broker/broker");
class ZGComputeNetworkBroker {
    ledger;
    inference;
    fineTuning;
    constructor(ledger, inferenceBroker, fineTuningBroker) {
        this.ledger = ledger;
        this.inference = inferenceBroker;
        this.fineTuning = fineTuningBroker;
    }
}
exports.ZGComputeNetworkBroker = ZGComputeNetworkBroker;
/**
 * createZGComputeNetworkBroker is used to initialize ZGComputeNetworkBroker
 *
 * @param signer - Signer from ethers.js.
 * @param ledgerCA - 0G Compute Network Ledger Contact address, use default address if not provided.
 * @param inferenceCA - 0G Compute Network Inference Serving contract address, use default address if not provided.
 * @param fineTuningCA - 0G Compute Network Fine Tuning Serving contract address, use default address if not provided.
 * @param gasPrice - Gas price for transactions. If not provided, the gas price will be calculated automatically.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
async function createZGComputeNetworkBroker(signer, ledgerCA = '0x70e1dD4B057B94b01D782c67b1A4B0F403277897', inferenceCA = '0x9A34fE4E3E29A6EB7e90b84b963E44591A58Ecc6', fineTuningCA = '0x58a9842553Dada1BE9741ceB916eD5b7119d510e', gasPrice, maxGasPrice, step) {
    try {
        const ledger = await (0, ledger_1.createLedgerBroker)(signer, ledgerCA, inferenceCA, fineTuningCA, gasPrice, maxGasPrice, step);
        const inferenceBroker = await (0, broker_2.createInferenceBroker)(signer, inferenceCA, ledger);
        let fineTuningBroker;
        if (signer instanceof ethers_1.Wallet) {
            fineTuningBroker = await (0, broker_1.createFineTuningBroker)(signer, fineTuningCA, ledger, gasPrice, maxGasPrice, step);
        }
        const broker = new ZGComputeNetworkBroker(ledger, inferenceBroker, fineTuningBroker);
        return broker;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=broker.js.map