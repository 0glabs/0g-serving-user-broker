import { createZGComputeNetworkBroker, ZGComputeNetworkBroker } from '../sdk'
import { ethers } from 'ethers'
import chalk from 'chalk'
import { Table } from 'cli-table3'
import { ZG_RPC_ENDPOINT_TESTNET } from './const'

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
    } catch (error) {
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
    } catch (error) {
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
