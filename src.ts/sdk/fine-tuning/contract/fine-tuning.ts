import {
    BigNumberish,
    AddressLike,
    Wallet,
    ContractMethodArgs,
    ContractTransactionReceipt,
} from 'ethers'
import { FineTuningServing, FineTuningServing__factory } from './typechain'
import {
    ServiceStructOutput,
    DeliverableStructOutput,
} from './typechain/FineTuningServing'
import { RETRY_ERROR_SUBSTRINGS } from '../../common/utils/const'

const TIMEOUT_MS = 300_000

export class FineTuningServingContract {
    public serving: FineTuningServing
    public signer: Wallet

    private _userAddress: string
    private _gasPrice?: number
    private _maxGasPrice?: bigint
    private _step: number

    constructor(
        signer: Wallet,
        contractAddress: string,
        userAddress: string,
        gasPrice?: number,
        maxGasPrice?: number,
        step?: number
    ) {
        this.serving = FineTuningServing__factory.connect(
            contractAddress,
            signer
        )
        this.signer = signer
        this._userAddress = userAddress
        this._gasPrice = gasPrice
        if (maxGasPrice) {
            this._maxGasPrice = BigInt(maxGasPrice)
        }
        this._step = step || 11
    }

    lockTime(): Promise<bigint> {
        return this.serving.lockTime()
    }

    async sendTx(
        name: string,
        txArgs: ContractMethodArgs<any[]>,
        txOptions: any
    ) {
        if (txOptions.gasPrice === undefined) {
            txOptions.gasPrice = (
                await this.signer.provider?.getFeeData()
            )?.gasPrice
        } else {
            txOptions.gasPrice = BigInt(txOptions.gasPrice)
        }
        while (true) {
            try {
                console.log('sending tx with gas price', txOptions.gasPrice)
                const tx = await this.serving.getFunction(name)(
                    ...txArgs,
                    txOptions
                )
                console.log('tx hash:', tx.hash)
                const receipt = (await Promise.race([
                    tx.wait(),
                    new Promise((_, reject) =>
                        setTimeout(
                            () =>
                                reject(
                                    new Error(
                                        'Get Receipt timeout, try set higher gas price'
                                    )
                                ),
                            TIMEOUT_MS
                        )
                    ),
                ])) as ContractTransactionReceipt | null

                this.checkReceipt(receipt)
                break
            } catch (error: any) {
                if (this._maxGasPrice === undefined) {
                    throw error
                }

                let errorMessage = ''
                if (error.message) {
                    errorMessage = error.message
                } else if (error.info?.error?.message) {
                    errorMessage = error.info.error.message
                }
                const shouldRetry = RETRY_ERROR_SUBSTRINGS.some((substr) =>
                    errorMessage.includes(substr)
                )

                if (!shouldRetry) {
                    throw error
                }
                console.log(
                    'Retrying transaction with higher gas price due to:',
                    errorMessage
                )
                let currentGasPrice = txOptions.gasPrice
                if (currentGasPrice >= this._maxGasPrice) {
                    throw error
                }
                currentGasPrice =
                    (currentGasPrice * BigInt(this._step)) / BigInt(10)
                if (currentGasPrice > this._maxGasPrice) {
                    currentGasPrice = this._maxGasPrice
                }
                txOptions.gasPrice = currentGasPrice
            }
        }
    }

    async listService(): Promise<ServiceStructOutput[]> {
        try {
            const services = await this.serving.getAllServices()
            return services
        } catch (error) {
            throw error
        }
    }

    async listAccount() {
        try {
            const accounts = await this.serving.getAllAccounts()
            return accounts
        } catch (error) {
            throw error
        }
    }

    async getAccount(provider: AddressLike) {
        try {
            const user = this.getUserAddress()
            const account = await this.serving.getAccount(user, provider)
            return account
        } catch (error) {
            throw error
        }
    }

    async acknowledgeProviderSigner(
        providerAddress: AddressLike,
        providerSigner: AddressLike,
        gasPrice?: number
    ) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            await this.sendTx(
                'acknowledgeProviderSigner',
                [providerAddress, providerSigner],
                txOptions
            )
        } catch (error) {
            throw error
        }
    }

    async acknowledgeDeliverable(
        providerAddress: AddressLike,
        index: BigNumberish,
        gasPrice?: number
    ) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            await this.sendTx(
                'acknowledgeDeliverable',
                [providerAddress, index],
                txOptions
            )
        } catch (error) {
            throw error
        }
    }

    async getService(providerAddress: string): Promise<ServiceStructOutput> {
        try {
            return this.serving.getService(providerAddress)
        } catch (error) {
            throw error
        }
    }

    async getDeliverable(
        providerAddress: AddressLike,
        index: BigNumberish
    ): Promise<DeliverableStructOutput> {
        try {
            const user = this.getUserAddress()
            return this.serving.getDeliverable(user, providerAddress, index)
        } catch (error) {
            throw error
        }
    }

    getUserAddress(): string {
        return this._userAddress
    }

    checkReceipt(receipt: ContractTransactionReceipt | null): void {
        if (!receipt) {
            throw new Error('Transaction failed with no receipt')
        }
        if (receipt.status !== 1) {
            throw new Error('Transaction reverted')
        }
    }
}
