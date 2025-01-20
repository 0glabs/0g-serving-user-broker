import { FineTuningServingContract } from '../contract'
import { Wallet } from 'ethers'
import { ModelProcessor } from './model'
import { ServiceProcessor } from './service'
import { LedgerBroker } from '../../ledger'
import { ZGStorage } from '../zg-storage/zg-storage'
import { Provider } from '../provider/provider'

export class FineTuningBroker {
    private signer: Wallet
    private fineTuningCA: string
    private ledger!: LedgerBroker
    private modelProcessor!: ModelProcessor
    private serviceProcessor!: ServiceProcessor
    private zgClient!: ZGStorage
    private serviceProvider!: Provider

    constructor(signer: Wallet, fineTuningCA: string, ledger: LedgerBroker) {
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

        this.modelProcessor = new ModelProcessor(
            contract,
            this.ledger,
            this.zgClient,
            this.serviceProvider
        )
        this.serviceProcessor = new ServiceProcessor(
            contract,
            this.ledger,
            this.zgClient,
            this.serviceProvider
        )
        this.serviceProvider = new Provider(contract)
        this.zgClient = new ZGStorage()
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

    public uploadDataset = async (dataPath: string): Promise<string> => {
        try {
            return await this.modelProcessor.uploadDataset(
                this.signer.privateKey,
                dataPath
            )
        } catch (error) {
            throw error
        }
    }

    public createTask = async (
        preTrainedModelName: string,
        dataSize: number,
        rootHash: string,
        isTurbo: boolean,
        providerAddress: string,
        serviceName: string,
        trainingPath: string
    ): Promise<void> => {
        try {
            return await this.serviceProcessor.createTask(
                preTrainedModelName,
                dataSize,
                rootHash,
                isTurbo,
                providerAddress,
                serviceName,
                trainingPath
            )
        } catch (error) {
            throw error
        }
    }

    public getTaskProgress = async (
        providerAddress: string,
        serviceName: string
    ): Promise<string> => {
        try {
            return await this.serviceProcessor.getTaskProgress(
                providerAddress,
                serviceName,
                await this.signer.getAddress()
            )
        } catch (error) {
            throw error
        }
    }

    public acknowledgeModel = async (
        providerAddress: string,
        dataPath: string
    ): Promise<void> => {
        try {
            return await this.modelProcessor.acknowledgeModel(
                providerAddress,
                dataPath
            )
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
    signer: Wallet,
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
