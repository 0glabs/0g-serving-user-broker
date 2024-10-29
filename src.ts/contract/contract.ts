import { JsonRpcSigner, BigNumberish, AddressLike } from 'ethers'
import { Serving, Serving__factory } from './serving'
import { ServiceStructOutput } from './serving/Serving'

export class ServingContract {
    public serving: Serving

    private _userAddress: string

    constructor(
        signer: JsonRpcSigner,
        contractAddress: string,
        userAddress: string
    ) {
        this.serving = Serving__factory.connect(contractAddress, signer)
        this._userAddress = userAddress
    }

    lockTime(): Promise<bigint> {
        return this.serving.lockTime()
    }

    async listService() {
        try {
            const services = await this.serving.getAllServices()
            return services
        } catch (error) {
            console.error('Error list services:', error)
            throw error
        }
    }

    async listAccount() {
        try {
            const accounts = await this.serving.getAllAccounts()
            return accounts
        } catch (error) {
            console.error('Error list accounts:', error)
            throw error
        }
    }

    async getAccount(user: AddressLike, provider: AddressLike) {
        try {
            const account = await this.serving.getAccount(user, provider)
            return account
        } catch (error) {
            console.error('Error get account:', error)
            throw error
        }
    }

    async addOrUpdateService(
        name: string,
        serviceType: string,
        url: string,
        model: string,
        inputPrice: BigNumberish,
        outputPrice: BigNumberish
    ) {
        try {
            const tx = await this.serving.addOrUpdateService(
                name,
                serviceType,
                url,
                model,
                inputPrice,
                outputPrice
            )

            const receipt = await tx.wait()

            if (receipt?.status === 1) {
                console.log('Transaction was successful!')
            } else {
                const error = new Error('Transaction failed')
                console.error(error.message)
                throw error
            }
        } catch (error) {
            console.error('Error sending transaction:', error)
            throw error
        }
    }

    async addAccount(
        providerAddress: AddressLike,
        signer: [BigNumberish, BigNumberish],
        balance: string
    ) {
        try {
            const tx = await this.serving.addAccount(providerAddress, signer, {
                value: BigInt(balance),
            })

            const receipt = await tx.wait()

            if (receipt?.status === 1) {
                console.log('Transaction was successful!')
            } else {
                const error = new Error('Transaction failed')
                console.error(error.message)
                throw error
            }
        } catch (error) {
            console.error('Error sending transaction:', error)
            throw error
        }
    }

    async depositFund(providerAddress: AddressLike, balance: string) {
        try {
            const tx = await this.serving.depositFund(providerAddress, {
                value: balance,
            })

            const receipt = await tx.wait()

            if (receipt?.status === 1) {
                console.log('Transaction was successful!')
            } else {
                const error = new Error('Transaction failed')
                console.error(error.message)
                throw error
            }
        } catch (error) {
            console.error('Error sending transaction:', error)
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
