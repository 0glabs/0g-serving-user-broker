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
    } catch (error: any) {
        alertError(error)
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
        alertError(error)
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

const alertError = (error: any) => {
    const errorPatterns = [
        {
            pattern: /LedgerNotExists/i,
            message:
                "Account does not exist. Please create an account using '0g-compute-cli add-account --amount <number_of_A0GI_you_want_to_deposit>'.",
        },
        {
            pattern: /ServiceNotExist/i,
            message:
                "The service provider does not exist. Please ensure the validity of the service provider's address specified with the '--provider' flag.",
        },
        {
            pattern: /AccountNotExist/i,
            message: 'The sub-account does not exist.',
        },
        {
            pattern: /AccountExist/i,
            message: 'The sub-account already exists.',
        },
        { pattern: /InsufficientBalance/i, message: 'Insufficient funds.' },
        {
            pattern: /InvalidVerifierInput/i,
            message: 'The verification input is invalid.',
        },
        {
            pattern: /Deliverable not acknowledged yet/i,
            message:
                "Deliverable not acknowledged yet. Please use '0g-compute-cli acknowledge-model --provider <provider_address> --data-path <path_to_save_model>' to acknowledge the deliverable.",
        },
        {
            pattern: /EncryptedSecret not found/i,
            message:
                "Secret to decrypt model not found. Please ensure the task status is 'Finished' using '0g-compute-cli get-task --provider <provider_address>'.",
        },
    ]

    const getErrorMessage = (error: any): string => {
        try {
            const errorMsg = JSON.stringify(error, null, 2)
            return errorMsg !== '{}' ? errorMsg : String(error)
        } catch {
            return String(error)
        }
    }

    const errorString = getErrorMessage(error)
    const matchedPattern = errorPatterns.find(({ pattern }) =>
        pattern.test(errorString)
    )

    if (matchedPattern) {
        console.error(
            'Operation failed:',
            matchedPattern.message,
            '\n\nComplete error:',
            error
        )
    } else {
        console.error('Operation failed:', error)
    }
}
