"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.splitIntoChunks = exports.neuronToA0gi = void 0;
exports.initBroker = initBroker;
exports.withLedgerBroker = withLedgerBroker;
exports.withFineTuningBroker = withFineTuningBroker;
const sdk_1 = require("../sdk");
const ethers_1 = require("ethers");
async function initBroker(options) {
    const provider = new ethers_1.ethers.JsonRpcProvider(options.rpc);
    const wallet = new ethers_1.ethers.Wallet(options.key, provider);
    return await (0, sdk_1.createZGComputeNetworkBroker)(wallet, options.ledgerCa, options.inferenceCa, options.fineTuningCa);
}
async function withLedgerBroker(options, action) {
    try {
        const broker = await initBroker(options);
        await action(broker);
    }
    catch (error) {
        console.error('Operation failed:', error);
    }
}
async function withFineTuningBroker(options, action) {
    try {
        const broker = await initBroker(options);
        if (broker.fineTuning) {
            await action(broker);
        }
        else {
            console.log('Fine tuning broker is not available.');
        }
    }
    catch (error) {
        console.error('Operation failed:', error);
    }
}
const neuronToA0gi = (value) => {
    const divisor = BigInt(10 ** 18);
    const integerPart = value / divisor;
    const remainder = value % divisor;
    const decimalPart = Number(remainder) / Number(divisor);
    return Number(integerPart) + decimalPart;
};
exports.neuronToA0gi = neuronToA0gi;
const splitIntoChunks = (str, size) => {
    const chunks = [];
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size));
    }
    return chunks.join('\n');
};
exports.splitIntoChunks = splitIntoChunks;
//# sourceMappingURL=util.js.map