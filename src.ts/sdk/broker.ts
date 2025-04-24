import { JsonRpcSigner, Wallet } from 'ethers'
import { createLedgerBroker, LedgerBroker } from './ledger'
import { createFineTuningBroker, FineTuningBroker } from './fine-tuning/broker'
import {
    createInferenceBroker,
    InferenceBroker,
} from './inference/broker/broker'

export class ZGComputeNetworkBroker {
    public ledger!: LedgerBroker
    public inference!: InferenceBroker
    public fineTuning?: FineTuningBroker

    constructor(
        ledger: LedgerBroker,
        inferenceBroker: InferenceBroker,
        fineTuningBroker?: FineTuningBroker
    ) {
        this.ledger = ledger
        this.inference = inferenceBroker
        this.fineTuning = fineTuningBroker
    }
}

/**
 * createZGComputeNetworkBroker is used to initialize ZGComputeNetworkBroker
 *
 * @param signer - Signer from ethers.js.
 * @param ledgerCA - 0G Compute Network Ledger Contact address, use default address if not provided.
 * @param inferenceCA - 0G Compute Network Inference Serving contract address, use default address if not provided.
 * @param fineTuningCA - 0G Compute Network Fine Tuning Serving contract address, use default address if not provided.
 * @param gasPrice - Gas price for transactions. If not provided, the gas price will be calculated automatically.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
export async function createZGComputeNetworkBroker(
    signer: JsonRpcSigner | Wallet,
    ledgerCA = '0xd70dC24E2c75B37B2294a719C5d732487563F7c4',
    inferenceCA = '0xB6C4cd83F695b1Ffb7fa260cedB13B03e8B2F472',
    fineTuningCA = '0xc0B71cA19184B678Fdd6eC729aa24f054E57c10c',
    gasPrice?: number,
    maxGasPrice?: number,
    step?: number
): Promise<ZGComputeNetworkBroker> {
    try {
        const ledger = await createLedgerBroker(
            signer,
            ledgerCA,
            inferenceCA,
            fineTuningCA,
            gasPrice,
            maxGasPrice,
            step
        )
        const inferenceBroker = await createInferenceBroker(
            signer,
            inferenceCA,
            ledger
        )

        let fineTuningBroker: FineTuningBroker | undefined
        if (signer instanceof Wallet) {
            fineTuningBroker = await createFineTuningBroker(
                signer,
                fineTuningCA,
                ledger,
                gasPrice,
                maxGasPrice,
                step
            )
        }

        const broker = new ZGComputeNetworkBroker(
            ledger,
            inferenceBroker,
            fineTuningBroker
        )
        return broker
    } catch (error) {
        throw error
    }
}
