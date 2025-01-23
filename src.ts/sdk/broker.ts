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
    ledgerCA = '0xB57857B6E892b0aDACd627e74cEFa6D39c7BdD13',
    inferenceCA = '0x3dF34461017f22eA871d7FFD4e98191794F8053d',
    fineTuningCA = '0x3A018CDD9DC4401375653cde0aa517ffeb1E27c4'
): Promise<ZGComputeNetworkBroker> {
    try {
        const ledger = await createLedgerBroker(
            signer,
            ledgerCA,
            inferenceCA,
            fineTuningCA
        )
        // TODO: Adapts the usage of the ledger broker to initialize the inference broker.
        const inferenceBroker = await createInferenceBroker(signer, inferenceCA)

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
