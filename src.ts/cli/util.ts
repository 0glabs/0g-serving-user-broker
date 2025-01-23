import { createZGComputeNetworkBroker, ZGComputeNetworkBroker } from '../sdk'
import { ethers } from 'ethers'

export async function initBroker(
    options: any
): Promise<ZGComputeNetworkBroker> {
    const provider = new ethers.JsonRpcProvider(options.rpc)
    const wallet = new ethers.Wallet(options.key, provider)

    return await createZGComputeNetworkBroker(
        wallet,
        options.ledgerCa,
        options.inferenceCa,
        options.fineTuningCa
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
