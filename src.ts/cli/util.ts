import { createZGComputeNetworkBroker, ZGComputeNetworkBroker } from '../sdk'
import { ethers } from 'ethers'
import chalk from 'chalk'
import { Table } from 'cli-table3'
import { ZG_RPC_ENDPOINT_TESTNET } from './const'

const errorPatterns = [
    {
        pattern: /ServiceNotExist/i,
        message:
            "The service provider doesn't exist. Please pass the right --provider",
    },
    {
        pattern: /AccountNotExist/i,
        message: "The sub account doesn't exist. Please create one first.",
    },
    { pattern: /AccountExist/i, message: 'The sub account already exists.' },
    { pattern: /InsufficientBalance/i, message: 'Insufficient funds.' },
    {
        pattern: /InvalidVerifierInput/i,
        message: 'The verification input is invalid.',
    },
    // add more patterns as needed
]

export async function initBroker(
    options: any
): Promise<ZGComputeNetworkBroker> {
    const provider = new ethers.JsonRpcProvider(
        options.rpc || process.env.RPC_ENDPOINT || ZG_RPC_ENDPOINT_TESTNET
    )
    const wallet = new ethers.Wallet(options.key, provider)

    return await createZGComputeNetworkBroker(
        wallet,
        options.ledgerCa || process.env.LEDGER_CA,
        options.inferenceCa || process.env.INFERENCE_CA,
        options.fineTuningCa || process.env.FINE_TUNING_CA,
        options.gasPrice
    )
}

export async function withLedgerBroker(
    options: any,
    action: (broker: ZGComputeNetworkBroker) => Promise<void>
) {
    try {
        const broker = await initBroker(options)
        await action(broker)
    } catch (error: any) {
        if (error.message) {
            console.error('Operation failed:', error.message)
            return
        }
        const errMsg = String(error)
        if (errMsg.includes('LedgerNotExist')) {
            console.log('Ledger does not exist. Please create a ledger first.')
            return
        }

        console.error('Operation failed:', error)
    }
}

export async function withFineTuningBroker(
    options: any,
    action: (broker: ZGComputeNetworkBroker) => Promise<void>
) {
    try {
        const broker = await initBroker(options)
        if (broker.fineTuning) {
            await action(broker)
        } else {
            console.log('Fine tuning broker is not available.')
        }
    } catch (error: any) {
        if (error.message) {
            console.error('Operation failed:', error.message)
            return
        }
        const errMsg = String(error)
        for (const { pattern, message } of errorPatterns) {
            if (pattern.test(errMsg)) {
                console.error('Operation failed:', message)
                return // stop after first match; or omit if you want to allow multiple matches
            }
        }
        console.error('Operation failed:', error)
    }
}

export const neuronToA0gi = (value: bigint): number => {
    const divisor = BigInt(10 ** 18)
    const integerPart = value / divisor
    const remainder = value % divisor
    const decimalPart = Number(remainder) / Number(divisor)

    return Number(integerPart) + decimalPart
}

export const splitIntoChunks = (str: string, size: number) => {
    const chunks: string[] = []
    for (let i = 0; i < str.length; i += size) {
        chunks.push(str.slice(i, i + size))
    }
    return chunks.join('\n')
}

export const printTableWithTitle = (title: string, table: Table) => {
    console.log(`\n${chalk.white(`  ${title}`)}\n` + table.toString())
}
