#!/usr/bin/env ts-node

import { Command } from 'commander'
import { splitIntoChunks, withFineTuningBroker } from './util'
import { FINE_TUNING_CA, LEDGER_CA, ZG_RPC_ENDPOINT_TESTNET } from './const'
import Table from 'cli-table3'

export default function fineTuning(program: Command) {
    program
        .command('acknowledge-provider-signer')
        .description('Acknowledge provider signer')
        .requiredOption('--provider <address>', 'Provider address')
        .requiredOption('--service <name>', 'Service name')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                await broker.fineTuning!.acknowledgeProviderSigner(
                    options.provider,
                    options.serviceName
                )
                console.log('Acknowledged provider signer')
            })
        })

    program
        .command('list-models')
        .description('List available models')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                const models = await broker.fineTuning!.listModel()
                console.log('Models:', models)
            })
        })

    program
        .command('upload')
        .description('Upload a dataset for fine-tuning')
        .requiredOption('--data-path <path>', 'Path to the dataset')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                await broker.fineTuning!.uploadDataset(options.dataPath)
            })
        })

    program
        .command('download')
        .description('Download a data')
        .requiredOption('--data-path <path>', 'Path to the dataset')
        .requiredOption('--data-root <path>', 'Path to the dataset')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                await broker.fineTuning!.downloadDataset(
                    options.dataPath,
                    options.dataRoot
                )
            })
        })

    program
        .command('create-task')
        .description('Create a fine-tuning task')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--provider <address>', 'Provider address for the task')
        .requiredOption('--service <name>', 'Service name for the task')
        .requiredOption('--model <name>', 'Pre-trained model name to use')
        .requiredOption('--data-size <size>', 'Size of the dataset')
        .requiredOption('--dataset <hash>', 'Hash of the dataset')
        .requiredOption(
            '--config-path <path>',
            'Fine-tuning configuration path'
        )
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                const taskId = await broker.fineTuning!.createTask(
                    options.provider,
                    options.service,
                    options.model,
                    parseInt(options.dataSize, 10),
                    options.dataset,
                    options.configPath
                )
                console.log('Created Task ID:', taskId)
            })
        })

    program
        .command('get-task')
        .description('Retrieve fine-tuning task information')
        .requiredOption('--provider <address>', 'Provider address')
        .requiredOption('--service <name>', 'Service name')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option(
            '--task <id>',
            'Task ID, if not provided, the latest task will be retrieved'
        )
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                const task = await broker.fineTuning!.getTask(
                    options.provider,
                    options.service,
                    options.task
                )
                const table = new Table({
                    head: ['Field', 'Value'],
                    colWidths: [35, 85],
                })
                table.push(['ID', task.id])
                table.push(['Created At', task.createdAt])
                table.push(['User Address', task.userAddress])
                table.push(['Service Name', task.serviceName])
                table.push(['Pre-trained Model Hash', task.preTrainedModelHash])
                table.push(['Dataset Hash', task.datasetHash])
                table.push(['Training Params', task.trainingParams])
                table.push(['Fee', task.fee])
                table.push(['Nonce', task.nonce])
                table.push(['Signature', splitIntoChunks(task.signature, 80)])
                table.push(['Progress', task.progress])
                table.push(['Deliver Index', task.deliverIndex])
                console.log(table.toString())
            })
        })

    program
        .command('get-log')
        .description('Retrieve fine-tuning task log')
        .requiredOption('--provider <address>', 'Provider address')
        .requiredOption('--service <name>', 'Service name')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--task <id>', 'Task ID')
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                const log = await broker.fineTuning!.getLog(
                    options.provider,
                    options.service,
                    options.task
                )
                console.log(log)
            })
        })

    program
        .command('acknowledge-model')
        .description('Acknowledge the availability of a model')
        .requiredOption('--provider <address>', 'Provider address')
        .requiredOption('--data-path <path>', 'Path to store the model')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                await broker.fineTuning!.acknowledgeModel(
                    options.provider,
                    options.dataPath
                )
                console.log('Acknowledged model')
            })
        })

    program
        .command('decrypt-model')
        .description('Decrypt a model')
        .requiredOption('--provider <address>', 'Provider address')
        .requiredOption(
            '--encrypted-model <path>',
            'Path to the encrypted model'
        )
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--output <path>', 'Path to the decrypted model')
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                await broker.fineTuning!.decryptModel(
                    options.provider,
                    options.encryptedModel,
                    options.output
                )
                console.log('Decrypted model')
            })
        })
}
