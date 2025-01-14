import { FineTuningServingContract } from '../contract'
import { JsonRpcSigner, Wallet } from 'ethers'
import { ModelProcessor } from './model'
import { ServiceProcessor } from './service'
import { LedgerBroker } from '../../ledger'

export class FineTuningBroker {
    private signer: JsonRpcSigner | Wallet
    private fineTuningCA: string
    private ledger!: LedgerBroker
    private modelProcessor!: ModelProcessor
    private serviceProcessor!: ServiceProcessor

    constructor(
        signer: JsonRpcSigner | Wallet,
        fineTuningCA: string,
        ledger: LedgerBroker
    ) {
        this.signer = signer
        this.fineTuningCA = fineTuningCA
        this.ledger = ledger
    }

    async initialize() {
        let userAddress: string
        try {
            userAddress = await this.signer.getAddress()
        } catch (error) {
            throw error
        }
        const contract = new FineTuningServingContract(
            this.signer,
            this.fineTuningCA,
            userAddress
        )

        this.modelProcessor = new ModelProcessor(contract, this.ledger)
        this.serviceProcessor = new ServiceProcessor(contract, this.ledger)
    }

    public listService = async () => {
        try {
            return await this.serviceProcessor.listService()
        } catch (error) {
            throw error
        }
    }

    public acknowledgeProviderSigner = async () => {
        try {
            return await this.serviceProcessor.acknowledgeProviderSigner()
        } catch (error) {
            throw error
        }
    }

    public uploadDataset = async (): Promise<string> => {
        try {
            return await this.modelProcessor.uploadDataset()
        } catch (error) {
            throw error
        }
    }

    public createTask = async (): Promise<void> => {
        try {
            return await this.serviceProcessor.createTask()
        } catch (error) {
            throw error
        }
    }

    public getTaskProgress = async (): Promise<string> => {
        try {
            return await this.serviceProcessor.getTaskProgress()
        } catch (error) {
            throw error
        }
    }

    public acknowledgeModel = async (): Promise<void> => {
        try {
            return await this.modelProcessor.acknowledgeModel()
        } catch (error) {
            throw error
        }
    }

    public decryptModel = async (): Promise<void> => {
        try {
            return await this.modelProcessor.decryptModel()
        } catch (error) {
            throw error
        }
    }
}

/**
 * createFineTuningBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
export async function createFineTuningBroker(
    signer: JsonRpcSigner | Wallet,
    contractAddress = '',
    ledger: LedgerBroker
): Promise<FineTuningBroker> {
    const broker = new FineTuningBroker(signer, contractAddress, ledger)
    try {
        await broker.initialize()
        return broker
    } catch (error) {
        throw error
    }
}
