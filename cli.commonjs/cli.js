#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const ethers_1 = require("ethers");
const sdk_1 = require("./sdk"); // 调整路径
const ZG_RPC_ENDPOINT_TESTNET = 'https://evmrpc-testnet.0g.ai';
const LEDGER_CA = '0xB57857B6E892b0aDACd627e74cEFa6D39c7BdD13';
// const INFERENCE_CA = '0x3dF34461017f22eA871d7FFD4e98191794F8053d'
const FINE_TUNING_CA = '0x3A018CDD9DC4401375653cde0aa517ffeb1E27c4';
const program = new commander_1.Command();
program
    .name('0g-compute-cli')
    .description('CLI for interacting with ZG Compute Network')
    .version('1.0.0');
async function initBroker(options) {
    const provider = new ethers_1.ethers.JsonRpcProvider(options.rpc);
    const wallet = new ethers_1.ethers.Wallet(options.privateKey, provider);
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
program
    .command('get-ledger')
    .description('Retrieve ledger information')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .action((options) => {
    withLedgerBroker(options, async (broker) => {
        const ledgerInfo = await broker.ledger.getLedger();
        console.log('Ledger Info:', ledgerInfo);
    });
});
program
    .command('add-ledger')
    .description('Add ledger balance')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('-a, --amount <number>', 'Ledger balance to add')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .action((options) => {
    withLedgerBroker(options, async (broker) => {
        await broker.ledger.addLedger(parseFloat(options.amount));
        // TODO: Return ledger address
        console.log('Added ledger with balance:', options.amount);
    });
});
program
    .command('deposit-fund')
    .description('Deposit funds into the ledger')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('-a, --amount <number>', 'Amount of funds to deposit')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .action((options) => {
    withLedgerBroker(options, async (broker) => {
        await broker.ledger.depositFund(parseFloat(options.amount));
        console.log('Deposited funds:', options.amount);
    });
});
program
    .command('refund')
    .description('Refund an amount from the ledger')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('-a, --amount <number>', 'Amount to refund')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .action((options) => {
    withLedgerBroker(options, async (broker) => {
        await broker.ledger.refund(parseFloat(options.amount));
        console.log('Refunded amount:', options.amount);
    });
});
program
    .command('transfer-fund')
    .description('Transfer funds to a provider')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('-p, --provider <address>', 'Provider address')
    .requiredOption('-t, --type <inference|fine-tuning>', 'Service type')
    .requiredOption('-a, --amount <bigint>', 'Amount to transfer')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .action((options) => {
    withLedgerBroker(options, async (broker) => {
        await broker.ledger.transferFund(options.provider, options.type, BigInt(options.amount));
        console.log('Transferred fund:', options.amount);
    });
});
program
    .command('retrieve-fund')
    .description('Retrieve funds from providers')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('-p, --providers <addresses>', 'Comma-separated list of provider addresses')
    .requiredOption('-t, --type <inference|fine-tuning>', 'Service type')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .action((options) => {
    withLedgerBroker(options, async (broker) => {
        const providers = options.providers.split(',');
        await broker.ledger.retrieveFund(providers, options.type);
        console.log('Retrieved funds for providers:', providers);
    });
});
program
    .command('delete-ledger')
    .description('Delete ledger')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .action((options) => {
    withLedgerBroker(options, async (broker) => {
        await broker.ledger.deleteLedger();
        console.log('Ledger deleted.');
    });
});
// Fine-tuning commands
program
    .command('list-fine-tuning-services')
    .description('List fine-tuning services')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        const services = await broker.fineTuning.listService();
        console.log('Services:', services);
    });
});
program
    .command('acknowledge-provider-signer')
    .description('Acknowledge provider signer')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('-p, --provider <address>', 'Provider address')
    .requiredOption('-s, --service-name <name>', 'Service name')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        await broker.fineTuning.acknowledgeProviderSigner(options.provider, options.serviceName);
        console.log('Acknowledged provider signer');
    });
});
program
    .command('list-models')
    .description('List available models')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        const models = await broker.fineTuning.listModel();
        console.log('Models:', models);
    });
});
program
    .command('upload-dataset')
    .description('Upload a dataset for fine-tuning')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('-d, --data-path <path>', 'Path to the dataset')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        await broker.fineTuning.uploadDataset(options.dataPath);
    });
});
program
    .command('create-task')
    .description('Create a fine-tuning task')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('--provider <address>', 'Provider address for the task')
    .requiredOption('--service <name>', 'Service name for the task')
    .requiredOption('--model <name>', 'Pre-trained model name to use')
    .requiredOption('--data-size <size>', 'Size of the dataset')
    .requiredOption('--dataset <hash>', 'Hash of the dataset')
    .requiredOption('--config-path <path>', 'Fine-tuning configuration path')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        const taskId = await broker.fineTuning.createTask(options.provider, options.service, options.model, parseInt(options.dataSize, 10), options.dataset, options.configPath);
        console.log('Created Task ID:', taskId);
    });
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map