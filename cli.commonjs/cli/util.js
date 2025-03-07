"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTableWithTitle = exports.splitIntoChunks = exports.neuronToA0gi = void 0;
exports.initBroker = initBroker;
exports.withLedgerBroker = withLedgerBroker;
exports.withFineTuningBroker = withFineTuningBroker;
const tslib_1 = require("tslib");
const sdk_1 = require("../sdk");
const ethers_1 = require("ethers");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const const_1 = require("./const");
const errorPatterns = [
    {
        pattern: /ServiceNotExist/i,
        message: "The service provider doesn't exist. Please pass the right --provider",
    },
    {
        pattern: /AccountNotExist/i,
        message: "The sub account doesn't exist. Please create one first.",
    },
    { pattern: /AccountExist/i, message: 'The sub account already exists.' },
    { pattern: /InsufficientBalance/i, message: 'Insufficient funds.' },
    {
        pattern: /InvalidVerifierInput/i,
        message: 'The verification input is invalid.',
    },
    // add more patterns as needed
];
async function initBroker(options) {
    const provider = new ethers_1.ethers.JsonRpcProvider(options.rpc || process.env.RPC_ENDPOINT || const_1.ZG_RPC_ENDPOINT_TESTNET);
    const wallet = new ethers_1.ethers.Wallet(options.key, provider);
    return await (0, sdk_1.createZGComputeNetworkBroker)(wallet, options.ledgerCa || process.env.LEDGER_CA, options.inferenceCa || process.env.INFERENCE_CA, options.fineTuningCa || process.env.FINE_TUNING_CA, options.gasPrice);
}
async function withLedgerBroker(options, action) {
    try {
        const broker = await initBroker(options);
        await action(broker);
    }
    catch (error) {
        if (error.message) {
            console.error('Operation failed:', error.message);
            return;
        }
        const errMsg = String(error);
        if (errMsg.includes('LedgerNotExist')) {
            console.log('Ledger does not exist. Please create a ledger first.');
            return;
        }
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
        if (error.message) {
            console.error('Operation failed:', error.message);
            return;
        }
        const errMsg = String(error);
        for (const { pattern, message } of errorPatterns) {
            if (pattern.test(errMsg)) {
                console.error('Operation failed:', message);
                return; // stop after first match; or omit if you want to allow multiple matches
            }
        }
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
const printTableWithTitle = (title, table) => {
    console.log(`\n${chalk_1.default.white(`  ${title}`)}\n` + table.toString());
};
exports.printTableWithTitle = printTableWithTitle;
//# sourceMappingURL=util.js.map