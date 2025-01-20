#!/usr/bin/env ts-node

import { Command } from 'commander'
import { ethers } from 'ethers'
import { createZGComputeNetworkBroker } from './sdk' // 替换为你 SDK 的文件路径

const program = new Command()

program
    .name('zg-cli')
    .description('CLI for interacting with ZG Compute Network')
    .version('1.0.0')

async function initBroker(options: any) {
    const provider = new ethers.JsonRpcProvider(options.provider)
    const wallet = new ethers.Wallet(options.privateKey, provider)

    return await createZGComputeNetworkBroker(
        wallet,
        options.ledgerCa,
        options.inferenceCa,
        options.fineTuningCa
    )
}

program
    .command('list-service')
    .description('List fine-tuning services')
    .requiredOption('-p, --provider <url>', '0G Chain provider URL')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .option('-l, --ledger-ca <address>', 'Ledger contract address', '')
    .option(
        '-i, --inference-ca <address>',
        'Inference contract address',
        '0xE7F0998C83a81f04871BEdfD89aB5f2DAcDBf435'
    )
    .option(
        '-f, --fine-tuning-ca <address>',
        'Fine Tuning contract address',
        ''
    )
    .action(async (options) => {
        try {
            const broker = await initBroker(options)

            if (broker.inference) {
                const services = await broker.inference.listService()
                console.log('Services:', services)
            } else {
                console.log('Fine tuning broker is not available.')
            }
        } catch (error) {
            console.error('Failed to list services:', error)
        }
    })

program.parse(process.argv)
