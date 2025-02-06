import { BigNumberish, AddressLike, Wallet } from 'ethers'
import { FineTuningServing, FineTuningServing__factory } from './typechain'
import {
    ServiceStructOutput,
    DeliverableStructOutput,
} from './typechain/FineTuningServing'

export class FineTuningServingContract {
    public serving: FineTuningServing
    public signer: Wallet

    private _userAddress: string
    private _gasPrice?: number

    constructor(
        signer: Wallet,
        contractAddress: string,
        userAddress: string,
        gasPrice?: number
    ) {
        this.serving = FineTuningServing__factory.connect(
            contractAddress,
            signer
        )
        this.signer = signer
        this._userAddress = userAddress
        this._gasPrice = gasPrice
    }

    lockTime(): Promise<bigint> {
        return this.serving.lockTime()
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
            const tx = await this.serving.acknowledgeProviderSigner(
                providerAddress,
                providerSigner,
                txOptions
            )

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed')
                throw error
            }
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
            const tx = await this.serving.acknowledgeDeliverable(
                providerAddress,
                index,
                txOptions
            )

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed')
                throw error
            }
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
}
