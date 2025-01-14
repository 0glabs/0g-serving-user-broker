import { JsonRpcSigner, BigNumberish, AddressLike, Wallet } from 'ethers'
import { InferenceServing, InferenceServing__factory } from './typechain'
import { ServiceStructOutput } from './typechain/InferenceServing'

export class InferenceServingContract {
    public serving: InferenceServing
    public signer: JsonRpcSigner | Wallet

    private _userAddress: string

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        userAddress: string
    ) {
        this.serving = InferenceServing__factory.connect(
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

    async deleteAccount(provider: AddressLike) {
        try {
            const user = this.getUserAddress()
            const tx = await this.serving.deleteAccount(user, provider)

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed')
                throw error
            }
        } catch (error) {
            throw error
        }
    }

    async addOrUpdateService(
        name: string,
        serviceType: string,
        url: string,
        model: string,
        verifiability: string,
        inputPrice: BigNumberish,
        outputPrice: BigNumberish
    ) {
        try {
            const tx = await this.serving.addOrUpdateService(
                name,
                serviceType,
                url,
                model,
                verifiability,
                inputPrice,
                outputPrice
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

    async addAccount(
        providerAddress: AddressLike,
        signer: [BigNumberish, BigNumberish],
        balance: bigint,
        settleSignerEncryptedPrivateKey: string
    ) {
        try {
            const user = this.getUserAddress()
            const tx = await this.serving.addAccount(
                user,
                providerAddress,
                signer,
                settleSignerEncryptedPrivateKey,
                {
                    value: balance,
                }
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

    async depositFund(providerAddress: AddressLike, balance: string) {
        try {
            const user = this.getUserAddress()
            const tx = await this.serving.depositFund(user, providerAddress, {
                value: balance,
            })

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

    getUserAddress(): string {
        return this._userAddress
    }
}
