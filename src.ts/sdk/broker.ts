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
    ledgerCA = '0x0854dB7b3607626608aB6A5f0208d14378b00e32',
    inferenceCA = '0xCa35028f675f7584C2BF7b57C39aE621b1a9E4A9',
    fineTuningCA = '0x38ae6632E63B61153A6FbCD163E79af1855EDa8B'
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
