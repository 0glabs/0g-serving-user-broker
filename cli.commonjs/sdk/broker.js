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
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
async function createZGComputeNetworkBroker(signer, ledgerCA = '0xC91c8794dCcCDd1be9850531d170ba38D748B9bF', inferenceCA = '0x03394Fcd07d2A8d251d4e6e6E814b0b6892F1f3c', fineTuningCA = '0xfc0Ad63a76eE844A65d92ABACB33cFE6350c5c38') {
    try {
        const ledger = await (0, ledger_1.createLedgerBroker)(signer, ledgerCA, inferenceCA, fineTuningCA);
        const inferenceBroker = await (0, broker_2.createInferenceBroker)(signer, inferenceCA, ledger);
        let fineTuningBroker;
        if (signer instanceof ethers_1.Wallet) {
            fineTuningBroker = await (0, broker_1.createFineTuningBroker)(signer, fineTuningCA, ledger);
        }
        const broker = new ZGComputeNetworkBroker(ledger, inferenceBroker, fineTuningBroker);
        return broker;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=broker.js.map