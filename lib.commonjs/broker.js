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
async function createZGComputeNetworkBroker(signer, ledgerCA = '0x0c0D02e4E849C711B2388A829366B5bf3f9c53e7', inferenceCA = '0x46e8a02d609CaEfC1747197da1F38272d5E46c77', fineTuningCA = '0x35A5d96569867fE6534D823268337888229533dE', gasPrice) {
    try {
        const ledger = await (0, ledger_1.createLedgerBroker)(signer, ledgerCA, inferenceCA, fineTuningCA, gasPrice);
        const inferenceBroker = await (0, broker_2.createInferenceBroker)(signer, inferenceCA, ledger);
        let fineTuningBroker;
        if (signer instanceof ethers_1.Wallet) {
            fineTuningBroker = await (0, broker_1.createFineTuningBroker)(signer, fineTuningCA, ledger, gasPrice);
        }
        const broker = new ZGComputeNetworkBroker(ledger, inferenceBroker, fineTuningBroker);
        return broker;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=broker.js.map