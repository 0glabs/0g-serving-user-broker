import { AddressLike } from 'ethers'
import { getNonce, signRequest, signTaskID } from '../../common/utils'
import { MODEL_HASH_MAP } from '../const'
import {
    AccountStructOutput,
    FineTuningServingContract,
    ServiceStructOutput,
} from '../contract'
import { Provider, Task } from '../provider/provider'
import { BrokerBase } from './base'
import * as fs from 'fs/promises'
import { LedgerBroker } from '../../ledger'
import { Automata } from '../../common/automata '
import * as readline from 'readline'

async function askUser(question: string): Promise<string> {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close()
            resolve(answer.trim())
        })
    })
}

export interface FineTuningAccountDetail {
    account: AccountStructOutput
    refunds: { amount: bigint; remainTime: bigint }[]
}
export class ServiceProcessor extends BrokerBase {
    protected automata: Automata

    constructor(
        contract: FineTuningServingContract,
        ledger: LedgerBroker,
        servingProvider: Provider
    ) {
        super(contract, ledger, servingProvider)
        this.automata = new Automata()
    }

    async getLockTime() {
        try {
            const lockTime = await this.contract.lockTime()
            return lockTime
        } catch (error) {
            throw error
        }
    }

    async getAccount(provider: AddressLike) {
        try {
            const account = await this.contract.getAccount(provider)
            return account
        } catch (error) {
            throw error
        }
    }

    async getAccountWithDetail(
        provider: AddressLike
    ): Promise<FineTuningAccountDetail> {
        try {
            const account = await this.contract.getAccount(provider)
            const lockTime = await this.getLockTime()
            const now = BigInt(Math.floor(Date.now() / 1000)) // Converts milliseconds to seconds
            const refunds = account.refunds
                .filter((refund) => !refund.processed)
                .map((refund) => ({
                    amount: refund.amount,
                    remainTime: lockTime - (now - refund.createdAt),
                }))

            return { account, refunds }
        } catch (error) {
            throw error
        }
    }

    async listService(): Promise<ServiceStructOutput[]> {
        try {
            const services = await this.contract.listService()
            return services
        } catch (error) {
            throw error
        }
    }

    async acknowledgeProviderSigner(
        providerAddress: string,
        gasPrice?: number
    ): Promise<void> {
        try {
            try {
                await this.contract.getAccount(providerAddress)
            } catch (error) {
                if (!(error as any).message.includes('AccountNotExists')) {
                    throw error
                } else {
                    await this.ledger.transferFund(
                        providerAddress,
                        'fine-tuning',
                        BigInt(0),
                        gasPrice
                    )
                }
            }

            let { quote, provider_signer } =
                await this.servingProvider.getQuote(providerAddress)
            if (!quote || !provider_signer) {
                throw new Error('Invalid quote')
            }
            if (!quote.startsWith('0x')) {
                quote = '0x' + quote
            }

            const rpc = process.env.RPC_ENDPOINT
            // bypass quote verification if testing on localhost
            if (!rpc || !/localhost|127\.0\.0\.1/.test(rpc)) {
                const isVerified = await this.automata.verifyQuote(quote)
                console.log('Quote verification:', isVerified)
                if (!isVerified) {
                    throw new Error('Quote verification failed')
                }
            }

            const account = await this.contract.getAccount(providerAddress)
            if (account.providerSigner === provider_signer) {
                console.log('Provider signer already acknowledged')
                return
            }

            await this.contract.acknowledgeProviderSigner(
                providerAddress,
                provider_signer,
                gasPrice
            )
        } catch (error) {
            throw error
        }
    }

    async createTask(
        providerAddress: string,
        preTrainedModelName: string,
        dataSize: number,
        datasetHash: string,
        trainingPath: string,
        gasPrice?: number
    ): Promise<string> {
        try {
            let preTrainedModelHash: string
            if (preTrainedModelName in MODEL_HASH_MAP) {
                preTrainedModelHash = MODEL_HASH_MAP[preTrainedModelName].turbo
            } else {
                let model = await this.servingProvider.getCustomizedModel(
                    providerAddress,
                    preTrainedModelName
                )
                preTrainedModelHash = model.hash
                console.log(`customized model hash: ${preTrainedModelHash}`)
            }

            const service = await this.contract.getService(providerAddress)
            const trainingParams = await fs.readFile(trainingPath, 'utf-8')
            const parsedParams = this.verifyTrainingParams(trainingParams)
            const trainEpochs =
                (parsedParams.num_train_epochs || parsedParams.total_steps) ?? 3
            const fee =
                service.pricePerToken * BigInt(dataSize) * BigInt(trainEpochs)

            console.log(
                `Estimated fee: ${fee} (neuron), data size: ${dataSize}, train epochs: ${trainEpochs}, price per token: ${service.pricePerToken} (neuron)`
            )

            const account = await this.contract.getAccount(providerAddress)
            if (account.balance - account.pendingRefund < fee) {
                await this.ledger.transferFund(
                    providerAddress,
                    'fine-tuning',
                    fee,
                    gasPrice
                )
            }

            const nonce = getNonce()
            const signature = await signRequest(
                this.contract.signer,
                this.contract.getUserAddress(),
                BigInt(nonce),
                datasetHash,
                fee
            )

            let wait = false
            const counter = await this.servingProvider.getPendingTaskCounter(
                providerAddress
            )
            if (counter > 0) {
                while (true) {
                    const answer = await askUser(
                        `There are ${counter} tasks in the queue. Do you want to continue? (yes/no): `
                    )

                    if (
                        answer.toLowerCase() === 'yes' ||
                        answer.toLowerCase() === 'y'
                    ) {
                        wait = true
                        break
                    } else if (['no', 'n'].includes(answer.toLowerCase())) {
                        throw new Error(
                            'User opted not to continue due to pending tasks in the queue.'
                        )
                    } else {
                        console.log(
                            'Invalid input. Please respond with yes/y or no/n.'
                        )
                    }
                }
            }
            const task: Task = {
                userAddress: this.contract.getUserAddress(),
                datasetHash,
                trainingParams,
                preTrainedModelHash,
                fee: fee.toString(),
                nonce: nonce.toString(),
                signature,
                wait,
            }

            return await this.servingProvider.createTask(providerAddress, task)
        } catch (error) {
            throw error
        }
    }

    async cancelTask(providerAddress: string, taskID: string): Promise<string> {
        try {
            const signature = await signTaskID(this.contract.signer, taskID)
            return await this.servingProvider.cancelTask(
                providerAddress,
                signature,
                taskID
            )
        } catch (error) {
            throw error
        }
    }

    async listTask(providerAddress: string): Promise<Task[]> {
        try {
            return await this.servingProvider.listTask(
                providerAddress,
                this.contract.getUserAddress()
            )
        } catch (error) {
            throw error
        }
    }

    async getTask(providerAddress: string, taskID?: string): Promise<Task> {
        try {
            if (!taskID) {
                const tasks = await this.servingProvider.listTask(
                    providerAddress,
                    this.contract.getUserAddress(),
                    true
                )
                if (tasks.length === 0) {
                    throw new Error('No task found')
                }
                return tasks[0]
            }

            return await this.servingProvider.getTask(
                providerAddress,
                this.contract.getUserAddress(),
                taskID
            )
        } catch (error) {
            throw error
        }
    }

    // 8. [`call provider`] call provider task progress api to get task progress
    async getLog(providerAddress: string, taskID?: string): Promise<string> {
        if (!taskID) {
            const tasks = await this.servingProvider.listTask(
                providerAddress,
                this.contract.getUserAddress(),
                true
            )
            taskID = tasks[0].id
            if (tasks.length === 0 || !taskID) {
                throw new Error('No task found')
            }
        }
        return this.servingProvider.getLog(
            providerAddress,
            this.contract.getUserAddress(),
            taskID
        )
    }

    async modelUsage(
        providerAddress: string,
        preTrainedModelName: string,
        output: string
    ) {
        try {
            return await this.servingProvider.getCustomizedModelDetailUsage(
                providerAddress,
                preTrainedModelName,
                output
            )
        } catch (error) {
            throw error
        }
    }

    private verifyTrainingParams(trainingParams: string): any {
        try {
            return JSON.parse(trainingParams)
        } catch (err) {
            const errorMessage =
                err instanceof Error ? err.message : 'An unknown error occurred'
            throw new Error(
                `Invalid JSON in trainingPath file: ${errorMessage}`
            )
        }
    }
}
