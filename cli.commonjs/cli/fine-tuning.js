#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fineTuning;
const tslib_1 = require("tslib");
const util_1 = require("./util");
const cli_table3_1 = tslib_1.__importDefault(require("cli-table3"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
const const_1 = require("./const");
function fineTuning(program) {
    program
        .command('verify')
        .description('verify TEE remote attestation of service')
        .requiredOption('--provider <address>', 'Provider address')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            await broker.fineTuning.acknowledgeProviderSigner(options.provider, options.gasPrice);
            console.log('Provider verified');
        });
    });
    program
        .command('list-models')
        .description('List available models')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            const models = await broker.fineTuning.listModel();
            const table = new cli_table3_1.default({
                head: [chalk_1.default.blue('Name'), chalk_1.default.blue('Description')],
                colWidths: [30, 75],
            });
            models.forEach((model) => {
                table.push([
                    model[0],
                    (0, util_1.splitIntoChunks)(model[1].description, 70),
                ]);
            });
            console.log(table.toString());
        });
    });
    program
        .command('upload')
        .description('Upload a dataset for fine-tuning')
        .requiredOption('--data-path <path>', 'Path to the dataset')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address, use default address if not provided')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address, use default address if not provided')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            await broker.fineTuning.uploadDataset(options.dataPath);
        });
    });
    program
        .command('download')
        .description('Download a data')
        .requiredOption('--data-path <path>', 'Path to the dataset')
        .requiredOption('--data-root <hash>', 'Root hash of the dataset')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .option(`--rpc <url>', '0G Chain RPC endpoint, default is ${const_1.ZG_RPC_ENDPOINT_TESTNET}`, const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            await broker.fineTuning.downloadDataset(options.dataPath, options.dataRoot);
        });
    });
    program
        .command('create-task')
        .description('Create a fine-tuning task')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--provider <address>', 'Provider address for the task')
        .requiredOption('--model <name>', 'Pre-trained model name to use')
        .requiredOption('--data-size <size>', 'Size of the dataset')
        .requiredOption('--dataset <hash>', 'Hash of the dataset')
        .requiredOption('--config-path <path>', 'Fine-tuning configuration path')
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            console.log('Verify provider...');
            await broker.fineTuning.acknowledgeProviderSigner(options.provider, options.gasPrice);
            console.log('Provider verified');
            console.log('Creating task...');
            const taskId = await broker.fineTuning.createTask(options.provider, options.model, parseInt(options.dataSize, 10), options.dataset, options.configPath, options.gasPrice);
            console.log('Created Task ID:', taskId);
        });
    });
    program
        .command('get-task')
        .description('Retrieve fine-tuning task information')
        .requiredOption('--provider <address>', 'Provider address')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .option('--task <id>', 'Task ID, if not provided, the latest task will be retrieved')
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            const task = await broker.fineTuning.getTask(options.provider, options.task);
            const table = new cli_table3_1.default({
                head: [chalk_1.default.blue('Field'), chalk_1.default.blue('Value')],
                colWidths: [35, 85],
            });
            table.push(['ID', task.id]);
            table.push(['Created At', task.createdAt]);
            table.push(['User Address', task.userAddress]);
            table.push(['Pre-trained Model Hash', task.preTrainedModelHash]);
            table.push(['Dataset Hash', task.datasetHash]);
            table.push(['Training Params', task.trainingParams]);
            table.push(['Fee', task.fee]);
            table.push(['Nonce', task.nonce]);
            table.push(['Signature', (0, util_1.splitIntoChunks)(task.signature, 80)]);
            table.push(['Progress', task.progress]);
            table.push(['Deliver Index', task.deliverIndex]);
            console.log(table.toString());
        });
    });
    program
        .command('get-log')
        .description('Retrieve fine-tuning task log')
        .requiredOption('--provider <address>', 'Provider address')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .option('--task <id>', 'Task ID, if not provided, the latest task will be retrieved')
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            const log = await broker.fineTuning.getLog(options.provider, options.task);
            console.log(log);
        });
    });
    program
        .command('acknowledge-model')
        .description('Acknowledge the availability of a model')
        .requiredOption('--provider <address>', 'Provider address')
        .requiredOption('--data-path <path>', 'Path to store the model')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            await broker.fineTuning.acknowledgeModel(options.provider, options.dataPath, options.gasPrice);
            console.log('Acknowledged model');
        });
    });
    program
        .command('decrypt-model')
        .description('Decrypt a model')
        .requiredOption('--provider <address>', 'Provider address')
        .requiredOption('--encrypted-model <path>', 'Path to the encrypted model')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--output <path>', 'Path to the decrypted model')
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Ledger contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            await broker.fineTuning.decryptModel(options.provider, options.encryptedModel, options.output);
            console.log('Decrypted model');
        });
    });
}
//# sourceMappingURL=fine-tuning.js.map