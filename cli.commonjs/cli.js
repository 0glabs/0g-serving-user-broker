#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const ethers_1 = require("ethers");
const sdk_1 = require("./sdk");
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
// Fine-tuning commands
program
    .command('get-fine-tuning-account')
    .description('Retrieve fine-tuning account information')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('--provider <address>', 'Provider address')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        const account = await broker.fineTuning.getAccount(options.provider);
        const deliverables = account.deliverables.map((d) => ({
            modelRootHash: d.modelRootHash,
            encryptedSecret: d.encryptedSecret,
        }));
        console.log(`Balance: ${account.balance.toString()}, Pending refund: ${account.pendingRefund.toString()}, Provider signer: ${account.providerSigner}, Deliverables: ${JSON.stringify(deliverables)}`);
    });
});
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
    .command('download-dataset')
    .description('Download a dataset for fine-tuning')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('--data-path <path>', 'Path to the dataset')
    .requiredOption('--data-root <path>', 'Path to the dataset')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        await broker.fineTuning.downloadDataset(options.dataPath, options.dataRoot);
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
program
    .command('get-task')
    .description('Retrieve fine-tuning task information')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('--provider <address>', 'Provider address')
    .requiredOption('--service <name>', 'Service name')
    .option('--task <id>', 'Task ID')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        const task = await broker.fineTuning.getTask(options.provider, options.service, options.task);
        console.log('Task ID:', task.id, 'Progress:', task.progress);
    });
});
program
    .command('get-log')
    .description('Retrieve fine-tuning task log')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('--provider <address>', 'Provider address')
    .requiredOption('--service <name>', 'Service name')
    .option('--task <id>', 'Task ID')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        const log = await broker.fineTuning.getLog(options.provider, options.service, options.task);
        console.log(log);
    });
});
program
    .command('acknowledge-model')
    .description('Acknowledge the availability of a model')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('--provider <address>', 'Provider address')
    .requiredOption('--data-path <path>', 'Path to store the model')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        await broker.fineTuning.acknowledgeModel(options.provider, options.dataPath);
        console.log('Acknowledged model');
    });
});
program
    .command('decrypt-model')
    .description('Decrypt a model')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .requiredOption('--provider <address>', 'Provider address')
    .requiredOption('--encrypted-model <path>', 'Path to the encrypted model')
    .requiredOption('--output <path>', 'Path to the decrypted model')
    .option('-r, --rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
    .option('-l, --ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', FINE_TUNING_CA)
    .action((options) => {
    withFineTuningBroker(options, async (broker) => {
        await broker.fineTuning.decryptModel(options.provider, options.encryptedModel, options.output);
        console.log('Decrypted model');
    });
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map