import { Wallet } from 'ethers'
import { createLedgerBroker, LedgerBroker } from './ledger'
import { createFineTuningBroker, FineTuningBroker } from './fine-tuning/broker'
import {
    createInferenceBroker,
    InferenceBroker,
} from './inference/broker/broker'

export class ZGComputeNetworkBroker {
    public ledger!: LedgerBroker
    public inference!: InferenceBroker
    public fineTuning!: FineTuningBroker

    constructor(
        ledger: LedgerBroker,
        inferenceBroker: InferenceBroker,
        fineTuningBroker: FineTuningBroker
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
    signer: Wallet,
    ledgerCA = '',
    inferenceCA = '0xE7F0998C83a81f04871BEdfD89aB5f2DAcDBf435',
    fineTuningCA = ''
): Promise<ZGComputeNetworkBroker> {
    try {
        const ledger = await createLedgerBroker(signer, ledgerCA)
        // TODO: Adapts the usage of the ledger broker to initialize the inference broker.
        const inferenceBroker = await createInferenceBroker(signer, inferenceCA)
        const fineTuningBroker = await createFineTuningBroker(
            signer,
            fineTuningCA,
            ledger
        )

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
