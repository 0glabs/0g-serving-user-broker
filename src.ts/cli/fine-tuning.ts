#!/usr/bin/env ts-node

import { Command } from 'commander'
import { splitIntoChunks, withFineTuningBroker } from './util'
import Table from 'cli-table3'
import chalk from 'chalk'
import { ZG_RPC_ENDPOINT_TESTNET } from './const'
import * as path from 'path'
import * as fs from 'fs/promises'
import { download } from '../sdk/fine-tuning/zg-storage'
import { TOKEN_COUNTER_MERKLE_ROOT } from '../sdk/fine-tuning/const'

export default function fineTuning(program: Command) {
    program
        .command('verify')
        .description('verify TEE remote attestation of service')
        .requiredOption('--provider <address>', 'Provider address')
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                await broker.fineTuning!.acknowledgeProviderSigner(
                    options.provider,
                    options.gasPrice
                )
                console.log('Provider verified')
            })
        })

    program
        .command('list-models')
        .description('List available models')
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                const models = await broker.fineTuning!.listModel()

                const table = new Table({
                    head: [chalk.blue('Name'), chalk.blue('Description')],
                    colWidths: [30, 75],
                })
                models.forEach((model) => {
                    table.push([
                        splitIntoChunks(model[0], 28),
                        splitIntoChunks(model[1].description, 73),
                    ])
                })

                console.log(table.toString())
            })
        })

    program
        .command('upload')
        .description('Upload a dataset for fine-tuning')
        .requiredOption('--data-path <path>', 'Path to the dataset')
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option(
            '--ledger-ca <address>',
            'Account (ledger) contract address, use default address if not provided'
        )
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address, use default address if not provided'
        )
        .option('--gas-price <price>', 'Gas price for transactions')
        .option('--model <name>', 'Pre-trained model name to use')
        .option('--use-python', 'use python to calculate token size', false)
        .option('--max-gas-price <price>', 'Max gas price for transactions')
        .option('--step <step>', 'Step for gas price adjustment')
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                await broker.fineTuning!.uploadDataset(
                    options.dataPath,
                    options.usePython,
                    options.gasPrice,
                    options.model
                )
            })
        })

    program
        .command('download')
        .description('Download a data')
        .requiredOption('--data-path <path>', 'Path to the dataset')
        .requiredOption('--data-root <hash>', 'Root hash of the dataset')
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option(
            `--rpc <url>', '0G Chain RPC endpoint, default is ${ZG_RPC_ENDPOINT_TESTNET}`,
            ZG_RPC_ENDPOINT_TESTNET
        )
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
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
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .requiredOption('--provider <address>', 'Provider address for the task')
        .requiredOption('--model <name>', 'Pre-trained model name to use')
        .option('--data-size <size>', 'Size of the dataset')
        .requiredOption('--dataset <hash>', 'Hash of the dataset')
        .requiredOption(
            '--config-path <path>',
            'Fine-tuning configuration path'
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .option('--dataset-path <path>', 'Fine-tuning dataset path')
        .option('--use-python', 'use python to calculate token size', false)
        .option('--max-gas-price <price>', 'Max gas price for transactions')
        .option('--step <step>', 'Step for gas price adjustment')
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                console.log('Verify provider...')
                await broker.fineTuning!.acknowledgeProviderSigner(
                    options.provider,
                    options.gasPrice
                )
                console.log('Provider verified')

                console.log('Creating task...')

                let dataSize: number | undefined = undefined
                if (options.dataSize !== undefined) {
                    dataSize = parseInt(options.dataSize, 10)
                }

                const taskId = await broker.fineTuning!.createTask(
                    options.provider,
                    options.model,
                    options.dataset,
                    options.configPath,
                    options.usePython,
                    dataSize,
                    options.gasPrice,
                    options.datasetPath
                )
                console.log('Created Task ID:', taskId)
            })
        })

    program
        .command('list-tasks')
        .description('Retrieve all fine-tuning task')
        .requiredOption('--provider <address>', 'Provider address')

        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                const tasks = await broker.fineTuning!.listTask(
                    options.provider
                )
                const table = new Table({
                    head: [
                        chalk.blue('ID'),
                        chalk.blue('Created At'),
                        chalk.blue('Status'),
                    ],
                    colWidths: [50, 30, 30],
                })
                for (const task of tasks) {
                    table.push([task.id, task.createdAt, task.progress])
                }
                console.log(table.toString())
            })
        })

    program
        .command('get-task')
        .description('Retrieve fine-tuning task information')
        .requiredOption('--provider <address>', 'Provider address')

        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option(
            '--task <id>',
            'Task ID, if not provided, the latest task will be retrieved'
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                const task = await broker.fineTuning!.getTask(
                    options.provider,
                    options.task
                )
                const table = new Table({
                    head: [chalk.blue('Field'), chalk.blue('Value')],
                    colWidths: [35, 85],
                })
                table.push(['ID', task.id])
                table.push(['Created At', task.createdAt])
                table.push(['Pre-trained Model Hash', task.preTrainedModelHash])
                table.push(['Dataset Hash', task.datasetHash])
                table.push([
                    'Training Params',
                    splitIntoChunks(task.trainingParams, 80),
                ])
                table.push(['Fee (neuron)', task.fee])
                table.push(['Progress', task.progress])
                console.log(table.toString())
            })
        })

    program
        .command('get-log')
        .description('Retrieve fine-tuning task log')
        .requiredOption('--provider <address>', 'Provider address')
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option(
            '--task <id>',
            'Task ID, if not provided, the latest task will be retrieved'
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                const log = await broker.fineTuning!.getLog(
                    options.provider,
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
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .option('--max-gas-price <price>', 'Max gas price for transactions')
        .option('--step <step>', 'Step for gas price adjustment')
        .action((options) => {
            withFineTuningBroker(options, async (broker) => {
                await broker.fineTuning!.acknowledgeModel(
                    options.provider,
                    options.dataPath,
                    options.gasPrice
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
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .requiredOption('--output <path>', 'Path to the decrypted model')
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Ledger contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
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

    program
        .command('download-counter')
        .description('Download token-counter')
        .option('--path <path>', 'Path to download')
        .action(async (options) => {
            let binaryDir = path.join(__dirname, '..', '..', 'binary')
            let executorDir = binaryDir
            if (options.path !== undefined) {
                executorDir = options.path
            }

            const versionFile = path.join(executorDir, 'token_counter.ver')
            const binaryFile = path.join(executorDir, 'token_counter')

            const storageClient = path.join(binaryDir, '0g-storage-client')
            try {
                await fs.access(storageClient, fs.constants.X_OK)
            } catch (err) {
                console.log(
                    `Grant execute permission (755) to the file ${storageClient}`
                )
                await fs.chmod(storageClient, 0o755)
            }

            await download(binaryFile, TOKEN_COUNTER_MERKLE_ROOT)
            await fs.chmod(binaryFile, 0o755)
            await fs.writeFile(versionFile, TOKEN_COUNTER_MERKLE_ROOT, 'utf8')
        })
}
