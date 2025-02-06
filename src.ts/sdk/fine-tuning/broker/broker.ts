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
    private _gasPrice?: number

    constructor(
        signer: Wallet,
        fineTuningCA: string,
        ledger: LedgerBroker,
        gasPrice?: number
    ) {
        this.signer = signer
        this.fineTuningCA = fineTuningCA
        this.ledger = ledger
        this._gasPrice = gasPrice
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
            userAddress,
            this._gasPrice
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

    public acknowledgeProviderSigner = async (
        providerAddress: string,
        gasPrice?: number
    ) => {
        try {
            return await this.serviceProcessor.acknowledgeProviderSigner(
                providerAddress,
                gasPrice
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
        trainingPath: string,
        gasPrice?: number
    ): Promise<string> => {
        try {
            return await this.serviceProcessor.createTask(
                providerAddress,
                preTrainedModelName,
                dataSize,
                datasetHash,
                trainingPath,
                gasPrice
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
        dataPath: string,
        gasPrice?: number
    ): Promise<void> => {
        try {
            return await this.modelProcessor.acknowledgeModel(
                providerAddress,
                dataPath,
                gasPrice
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
 * @param ledger - Ledger broker instance.
 * @param gasPrice - Gas price for transactions. If not provided, the gas price will be calculated automatically.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
export async function createFineTuningBroker(
    signer: Wallet,
    contractAddress = '',
    ledger: LedgerBroker,
    gasPrice?: number
): Promise<FineTuningBroker> {
    const broker = new FineTuningBroker(
        signer,
        contractAddress,
        ledger,
        gasPrice
    )
    try {
        await broker.initialize()
        return broker
    } catch (error) {
        throw error
    }
}
