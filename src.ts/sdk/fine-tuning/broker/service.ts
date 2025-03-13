import { AddressLike } from 'ethers'
import { getNonce, signRequest } from '../../common/utils'
import { MODEL_HASH_MAP, TOKEN_COUNTER_MERKLE_ROOT } from '../const'
import {
    AccountStructOutput,
    FineTuningServingContract,
    ServiceStructOutput,
} from '../contract'
import { Provider, Task } from '../provider/provider'
import { BrokerBase } from './base'
import * as fs from 'fs/promises'
import { LedgerBroker } from '../../ledger'
import { Automata } from '../automata '

import { calculateTokenSizeViaPython, calculateTokenSizeViaExe } from '../token'

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

    // 5. acknowledge provider signer
    //     1. [`call provider url/v1/quote`] call provider quote api to download quote (contains provider signer)
    //     2. [`TBD`] verify the quote using third party service (TODO: discuss with Phala)
    //     3. [`call contract`] acknowledge the provider signer in contract
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
                if (!isVerified) {
                    throw new Error('Quote verification failed')
                }
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

    // 7. create task
    //     1. get preTrained model root hash based on the model
    //     2. [`call contract`] calculate fee
    //     3. [`call contract`] transfer fund from ledger to fine-tuning provider
    //     4. [`call provider url/v1/task`]call provider task creation api to create task
    async createTask(
        providerAddress: string,
        preTrainedModelName: string,
        datasetHash: string,
        trainingPath: string,
        usePython: boolean,
        dataSize?: number,
        gasPrice?: number,
        datasetPath?: string
    ): Promise<string> {
        try {
            const service = await this.contract.getService(providerAddress)

            if (dataSize === undefined) {
                if (datasetPath !== undefined) {
                    if (usePython) {
                        dataSize = await calculateTokenSizeViaPython(
                            MODEL_HASH_MAP[preTrainedModelName].tokenizer,
                            datasetPath,
                            MODEL_HASH_MAP[preTrainedModelName].type
                        )
                    } else {
                        dataSize = await calculateTokenSizeViaExe(
                            MODEL_HASH_MAP[preTrainedModelName].tokenizer,
                            datasetPath,
                            MODEL_HASH_MAP[preTrainedModelName].type,
                            TOKEN_COUNTER_MERKLE_ROOT
                        )
                    }
                } else {
                    throw new Error(
                        'At least one of dataSize or datasetPath must be provided.'
                    )
                }
            }

            const trainingParams = await fs.readFile(trainingPath, 'utf-8')
            const parsedParams = this.verifyTrainingParams(trainingParams)
            const trainEpochs = parsedParams.num_train_epochs ?? 3
            const fee =
                service.pricePerToken * BigInt(dataSize) * BigInt(trainEpochs)
            console.log(`Total fee ${fee}`)

            await this.ledger.transferFund(
                providerAddress,
                'fine-tuning',
                fee,
                gasPrice
            )

            const nonce = getNonce()
            const signature = await signRequest(
                this.contract.signer,
                this.contract.getUserAddress(),
                BigInt(nonce),
                datasetHash,
                fee
            )

            const task: Task = {
                userAddress: this.contract.getUserAddress(),
                datasetHash,
                trainingParams,
                preTrainedModelHash: MODEL_HASH_MAP[preTrainedModelName].turbo,
                fee: fee.toString(),
                nonce: nonce.toString(),
                signature,
            }

            return await this.servingProvider.createTask(providerAddress, task)
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
