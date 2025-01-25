import { JsonRpcSigner, AddressLike, Wallet } from 'ethers'
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
