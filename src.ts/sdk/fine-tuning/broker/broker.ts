import { FineTuningServingContract } from '../contract'
import { Wallet } from 'ethers'
import { ModelProcessor } from './model'
import { FineTuningAccountDetail, ServiceProcessor } from './service'
import { LedgerBroker } from '../../ledger'
import { Provider, Task } from '../provider/provider'

export class FineTuningBroker {
    private signer: Wallet
    private fineTuningCA: string
    private ledger!: LedgerBroker
    private modelProcessor!: ModelProcessor
    private serviceProcessor!: ServiceProcessor
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

        this.serviceProvider = new Provider(contract)
        this.modelProcessor = new ModelProcessor(
            contract,
            this.ledger,
            this.serviceProvider
        )
        this.serviceProcessor = new ServiceProcessor(
            contract,
            this.ledger,
            this.serviceProvider
        )
    }

    public listService = async () => {
        try {
            return await this.serviceProcessor.listService()
        } catch (error) {
            throw error
        }
    }

    public getLockedTime = async () => {
        try {
            return await this.serviceProcessor.getLockTime()
        } catch (error) {
            throw error
        }
    }

    public getAccount = async (providerAddress: string) => {
        try {
            return await this.serviceProcessor.getAccount(providerAddress)
        } catch (error) {
            throw error
        }
    }

    public getAccountWithDetail = async (
        providerAddress: string
    ): Promise<FineTuningAccountDetail> => {
        try {
            return await this.serviceProcessor.getAccountWithDetail(
                providerAddress
            )
        } catch (error) {
            throw error
        }
    }

    public acknowledgeProviderSigner = async (providerAddress: string) => {
        try {
            return await this.serviceProcessor.acknowledgeProviderSigner(
                providerAddress
            )
        } catch (error) {
            throw error
        }
    }

    public listModel = () => {
        try {
            return this.modelProcessor.listModel()
        } catch (error) {
            throw error
        }
    }

    public uploadDataset = async (dataPath: string): Promise<void> => {
        try {
            await this.modelProcessor.uploadDataset(
                this.signer.privateKey,
                dataPath
            )
        } catch (error) {
            throw error
        }
    }

    public downloadDataset = async (
        dataPath: string,
        dataRoot: string
    ): Promise<void> => {
        try {
            await this.modelProcessor.downloadDataset(dataPath, dataRoot)
        } catch (error) {
            throw error
        }
    }

    public createTask = async (
        providerAddress: string,
        preTrainedModelName: string,
        dataSize: number,
        datasetHash: string,
        trainingPath: string
    ): Promise<string> => {
        try {
            return await this.serviceProcessor.createTask(
                providerAddress,
                preTrainedModelName,
                dataSize,
                datasetHash,
                trainingPath
            )
        } catch (error) {
            throw error
        }
    }

    public getTask = async (
        providerAddress: string,
        taskID?: string
    ): Promise<Task> => {
        try {
            const task = await this.serviceProcessor.getTask(
                providerAddress,
                taskID
            )
            return task
        } catch (error) {
            throw error
        }
    }

    public getLog = async (
        providerAddress: string,
        taskID?: string
    ): Promise<string> => {
        try {
            return await this.serviceProcessor.getLog(providerAddress, taskID)
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

    public decryptModel = async (
        providerAddress: string,
        encryptedModelPath: string,
        decryptedModelPath: string
    ): Promise<void> => {
        try {
            return await this.modelProcessor.decryptModel(
                providerAddress,
                encryptedModelPath,
                decryptedModelPath
            )
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
