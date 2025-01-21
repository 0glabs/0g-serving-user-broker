import { JsonRpcSigner, BigNumberish, AddressLike, Wallet } from 'ethers'
import { FineTuningServing, FineTuningServing__factory } from './typechain'
import { ServiceStructOutput, DeliverableStructOutput } from './typechain/FineTuningServing'

export class FineTuningServingContract {
    public serving: FineTuningServing
    public signer: JsonRpcSigner | Wallet

    private _userAddress: string

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        userAddress: string
    ) {
        this.serving = FineTuningServing__factory.connect(
            contractAddress,
            signer
        )
        this.signer = signer
        this._userAddress = userAddress
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
        providerSigner: AddressLike
    ) {
        try {
            const tx = await this.serving.acknowledgeProviderSigner(
                providerAddress,
                providerSigner
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
        index: BigNumberish
    ) {
        try {
            const tx = await this.serving.acknowledgeDeliverable(
                providerAddress,
                index
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

    async getService(
        providerAddress: string,
        svcName: string
    ): Promise<ServiceStructOutput> {
        try {
            return this.serving.getService(providerAddress, svcName)
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
