#!/usr/bin/env ts-node

import { Command } from 'commander'
import { neuronToA0gi, splitIntoChunks, withFineTuningBroker } from './util'
import { FINE_TUNING_CA, LEDGER_CA, ZG_RPC_ENDPOINT_TESTNET } from './const'
import Table from 'cli-table3'
import chalk from 'chalk'

export default function (program: Command) {
    program
        .command('get-account')
        .description('Retrieve fine-tuning account information')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--provider <address>', 'Provider address')
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .option('--infer', 'get inference account information')
        .action((options: any) => {
            if (options.infer) {
                // withLedgerBroker(options, async (broker) => {
                //     const account = await broker.ledger.getInferenceAccount(
                //         options.provider
                //     )
                //     console.log(
                //         `Balance: ${account.balance.toString()}, Pending refund: ${account.pendingRefund.toString()}, Provider signer: ${
                //             account.providerSigner
                //         }`
                //     )
                // })
                return
            }
            withFineTuningBroker(options, async (broker) => {
                const account = await broker.fineTuning!.getAccount(
                    options.provider
                )

                const table = new Table({
                    head: ['Field', 'Value'],
                    colWidths: [35, 85],
                })

                table.push(['Balance (A0GI)', neuronToA0gi(account.balance)])
                table.push([
                    'Pending Refund (A0GI)',
                    neuronToA0gi(account.pendingRefund),
                ])
                table.push(['Provider Signer', account.providerSigner])

                account.deliverables.forEach((deliverable, index) => {
                    table.push([
                        `Model Root Hash ${index + 1}`,
                        deliverable.modelRootHash,
                    ])
                    table.push([
                        `Encrypted Secret ${index + 1}`,
                        splitIntoChunks(deliverable.encryptedSecret, 80),
                    ])
                })

                console.log(table.toString())
            })
        })

    program
        .command('list-services')
        .description('List fine-tuning services')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', LEDGER_CA)
        .option(
            '--fine-tuning-ca <address>',
            'Fine Tuning contract address',
            FINE_TUNING_CA
        )
        .action((options: any) => {
            if (options.infer) {
                return
            }
            withFineTuningBroker(options, async (broker) => {
                const services = await broker.fineTuning!.listService()

                const table = new Table({
                    head: ['Field', 'Value'],
                    colWidths: [60, 50],
                })

                services.forEach((service, index) => {
                    table.push([
                        chalk.blue(`Provider ${index + 1}`),
                        chalk.blue(service.provider),
                    ])
                    table.push(['Service Name', service.name])
                    table.push(['URL', service.url])
                    table.push([
                        'Quota(CPU, Memory, GPU Count, Storage, CPU Type)',
                        service.quota.toString(),
                    ])
                    table.push([
                        'Price Per Byte in Dataset',
                        service.pricePerToken.toString(),
                    ])
                    table.push(['Occupied', service.occupied.toString()])
                })
                console.log(table.toString())
            })
        })
}
