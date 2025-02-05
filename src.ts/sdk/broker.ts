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
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
export async function createZGComputeNetworkBroker(
    signer: JsonRpcSigner | Wallet,
    ledgerCA = '0xC91c8794dCcCDd1be9850531d170ba38D748B9bF',
    inferenceCA = '0x03394Fcd07d2A8d251d4e6e6E814b0b6892F1f3c',
    fineTuningCA = '0xfc0Ad63a76eE844A65d92ABACB33cFE6350c5c38'
): Promise<ZGComputeNetworkBroker> {
    try {
        const ledger = await createLedgerBroker(
            signer,
            ledgerCA,
            inferenceCA,
            fineTuningCA
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
                ledger
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
