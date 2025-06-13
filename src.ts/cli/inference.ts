#!/usr/bin/env ts-node

import { Command } from 'commander'
import { withBroker } from './util'

export default function inference(program: Command) {
    program
        .command('ack-provider')
        .description('verify TEE remote attestation of service')
        .requiredOption('--provider <address>', 'Provider address')
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .action((options) => {
            withBroker(options, async (broker) => {
                await broker.inference.acknowledgeProviderSigner(
                    options.provider,
                    options.gasPrice
                )
                console.log('Provider acknowledged successfully!')
            })
        })

    program
        .command('serve')
        .description('Start local inference service')
        .requiredOption('--provider <address>', 'Provider address')
        .option(
            '--key <key>',
            'Wallet private key, if not provided, ensure the default key is set in the environment',
            process.env.ZG_PRIVATE_KEY
        )
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .option(
            '--port <port>',
            'Port to run the local inference service on',
            '3000'
        )
        .option(
            '--host <host>',
            'Host to bind the local inference service',
            '0.0.0.0'
        )
        .action(async (options) => {
            const { runInferenceServer } = await import(
                '../example/inference-server'
            )
            await runInferenceServer(options)
        })
}
