#!/usr/bin/env ts-node

import { Command } from 'commander'
import {
    splitIntoChunks,
    neuronToA0gi,
    printTableWithTitle,
    withFineTuningBroker,
} from './util'
import Table from 'cli-table3'
import chalk from 'chalk'
import { hexToRoots } from '../sdk/common/utils'

export default function (program: Command) {
    program
        .command('get-sub-account')
        .description('Retrieve sub account information')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--provider <address>', 'Provider address')
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option(
            '--infer',
            'get sub-account for inference, default is fine-tuning'
        )
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
                if (!broker.fineTuning) {
                    console.log('Fine tuning broker is not available.')
                    return
                }
                const { account, refunds } =
                    await broker.fineTuning.getAccountWithDetail(
                        options.provider
                    )
                let table = new Table({
                    head: [chalk.blue('Field'), chalk.blue('Value')],
                    colWidths: [50, 50],
                })
                table.push(['Provider', account.provider])
                table.push([
                    'Balance (A0GI)',
                    neuronToA0gi(account.balance).toFixed(18),
                ])
                table.push([
                    'Funds Applied for Return to Main Account (A0GI)',
                    neuronToA0gi(account.pendingRefund).toFixed(18),
                ])

                printTableWithTitle('Overview', table)

                table = new Table({
                    head: [
                        chalk.blue('Amount (A0GI)'),
                        chalk.blue('Remaining Locked Time'),
                    ],
                    colWidths: [50, 50],
                })

                refunds.forEach((refund) => {
                    const totalSeconds = Number(refund.remainTime)
                    const hours = Math.floor(totalSeconds / 3600)
                    const minutes = Math.floor((totalSeconds % 3600) / 60)
                    const secs = totalSeconds % 60

                    table.push([
                        neuronToA0gi(refund.amount).toFixed(18),
                        `${hours}h ${minutes}min ${secs}s`,
                    ])
                })

                printTableWithTitle(
                    'Details of Each Amount Applied for Return to Main Account',
                    table
                )

                table = new Table({
                    head: [
                        chalk.blue('Root Hash'),
                        chalk.blue('Access Confirmed'),
                    ],
                    colWidths: [75, 25],
                })

                account.deliverables.forEach((deliverable) => {
                    table.push([
                        splitIntoChunks(
                            hexToRoots(deliverable.modelRootHash),
                            60
                        ),
                        deliverable.acknowledged
                            ? chalk.greenBright.bold('\u2713')
                            : '',
                    ])
                })

                printTableWithTitle('Deliverables', table)
            })
        })

    program
        .command('list-providers')
        .description('List fine-tuning providers')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options: any) => {
            if (options.infer) {
                return
            }
            withFineTuningBroker(options, async (broker) => {
                const services = await broker.fineTuning!.listService()
                const table = new Table({
                    colWidths: [50, 50],
                })

                services.forEach((service, index) => {
                    table.push([
                        chalk.blue(`Provider ${index + 1}`),
                        chalk.blue(service.provider),
                    ])
                    let available = !service.occupied ? '\u2713' : `\u2717`

                    if (service.providerSigner) {
                    }
                    table.push(['Available', available])
                    table.push([
                        'Price Per Byte in Dataset (A0GI)',
                        neuronToA0gi(service.pricePerToken).toFixed(18),
                    ])
                    table.push(['URL', service.url])
                    // TODO: Show quota when backend ready
                    // table.push([
                    //     'Quota(CPU, Memory, GPU Count, Storage, CPU Type)',
                    //     service.quota.toString(),
                    // ])
                })
                console.log(table.toString())
            })
        })
}
