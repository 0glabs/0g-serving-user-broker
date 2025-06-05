"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.printTableWithTitle = exports.splitIntoChunks = exports.neuronToA0gi = void 0;
exports.initBroker = initBroker;
exports.withBroker = withBroker;
exports.withFineTuningBroker = withFineTuningBroker;
const tslib_1 = require("tslib");
const sdk_1 = require("../sdk");
const ethers_1 = require("ethers");
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const const_1 = require("./const");
async function initBroker(options) {
    const provider = new ethers_1.ethers.JsonRpcProvider(options.rpc || process.env.RPC_ENDPOINT || const_1.ZG_RPC_ENDPOINT_TESTNET);
    const wallet = new ethers_1.ethers.Wallet(options.key, provider);
    return await (0, sdk_1.createZGComputeNetworkBroker)(wallet, options.ledgerCa || process.env.LEDGER_CA, options.inferenceCa || process.env.INFERENCE_CA, options.fineTuningCa || process.env.FINE_TUNING_CA, options.gasPrice, options.maxGasPrice, options.step);
}
async function withBroker(options, action) {
    try {
        const broker = await initBroker(options);
        await action(broker);
    }
    catch (error) {
        alertError(error);
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
        alertError(error);
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
const alertError = (error) => {
    const errorPatterns = [
        {
            pattern: /LedgerNotExists/i,
            message: "Account does not exist. Please create an account using '0g-compute-cli add-account --amount <number_of_A0GI_you_want_to_deposit>'.",
        },
        {
            pattern: /ServiceNotExist/i,
            message: "The service provider does not exist. Please ensure the validity of the service provider's address specified with the '--provider' flag.",
        },
        {
            pattern: /AccountNotExist/i,
            message: 'The sub-account does not exist.',
        },
        {
            pattern: /AccountExist/i,
            message: 'The sub-account already exists.',
        },
        { pattern: /InsufficientBalance/i, message: 'Insufficient funds.' },
        {
            pattern: /InvalidVerifierInput/i,
            message: 'The verification input is invalid.',
        },
        {
            pattern: /Deliverable not acknowledged yet/i,
            message: "Deliverable not acknowledged yet. Please use '0g-compute-cli acknowledge-model --provider <provider_address> --data-path <path_to_save_model>' to acknowledge the deliverable.",
        },
        {
            pattern: /EncryptedSecret not found/i,
            message: "Secret to decrypt model not found. Please ensure the task status is 'Finished' using '0g-compute-cli get-task --provider <provider_address>'.",
        },
    ];
    const getErrorMessage = (error) => {
        try {
            const errorMsg = JSON.stringify(error, null, 2);
            return errorMsg !== '{}' ? errorMsg : String(error);
        }
        catch {
            return String(error);
        }
    };
    const errorString = getErrorMessage(error);
    const matchedPattern = errorPatterns.find(({ pattern }) => pattern.test(errorString));
    if (matchedPattern) {
        console.error('Operation failed:', matchedPattern.message, '\n\nComplete error:', error);
    }
    else {
        console.error('Operation failed:', error);
    }
};
//# sourceMappingURL=util.js.map