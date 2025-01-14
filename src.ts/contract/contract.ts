import { AddressLike, BigNumberish, JsonRpcSigner, Wallet } from 'ethers'
import {
    FineTuneAccountStruct,
    FineTuneServiceStruct,
    FineTuneServing,
    FineTuneServing__factory, InferenceAccountStruct, InferenceServiceStruct,
    InferenceServing,
    InferenceServing__factory,
    QuotaStructOutput,
    LedgerManager,
    LedgerStructOutput,
    LedgerManager__factory
} from './'
import { QuotaStruct } from './finetune/FineTuneServing'

export class FineTuneServingContract {
    public serving: FineTuneServing
    public signer: JsonRpcSigner | Wallet

    private _userAddress: string

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        userAddress: string
    ) {
        this.serving = FineTuneServing__factory.connect(contractAddress, signer)
        this.signer = signer
        this._userAddress = userAddress
    }

    lockTime(): Promise<bigint> {
        return this.serving.lockTime()
    }

    async canExecute(modelName : string, quota : QuotaStructOutput) : Promise<boolean> {
        // TODO: add comparision for quota
        return true;
        // return quota.cpuCount > 2;
    }

    async listService(): Promise<FineTuneServiceStruct[]> {
        try {
            return await this.serving.getAllServices()
        } catch (error) {
            throw error
        }
    }

    async listAccount() : Promise<FineTuneAccountStruct[]> {
        try {
            return await this.serving.getAllAccounts()
        } catch (error) {
            throw error
        }
    }

    async getAccount(provider: AddressLike) : Promise<FineTuneAccountStruct> {
        try {
            const user = this.getUserAddress()
            return await this.serving.getAccount(user, provider)
        } catch (error) {
            throw error
        }
    }

    async deleteAccount(provider: AddressLike) {
        try {
            const tx =
                await this.serving.deleteAccount(this.getUserAddress(), provider)

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                throw new Error('Finetune deleteAccount failed')
            }
        } catch (error) {
            throw error
        }
    }

    async addOrUpdateService(
        name: string,
        url: string,
        quota: QuotaStruct,
        pricePerToken: BigNumberish,
        occupied: boolean
    ) {
        try {
            const tx = await this.serving.addOrUpdateService(
                name,
                url,
                quota,
                pricePerToken,
                occupied
            )

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                throw new Error('Finetune addOrUpdateService failed')
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
            const tx = await this.serving.addAccount(
                this.getUserAddress(),
                providerAddress,
                signer,
                settleSignerEncryptedPrivateKey,
                // todo: can we do this for balance?
                {
                    value: balance,
                }
            )

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                throw new Error('Finetuning addAccount failed')
            }
        } catch (error) {
            throw error
        }
    }

    async depositFund(providerAddress: AddressLike, balance: string) {
        try {
            const tx = await this.serving.depositFund(
                this.getUserAddress(),
                providerAddress, {
                value: balance,
            })

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                throw new Error('Finetuning depositFund failed')
            }
        } catch (error) {
            throw error
        }
    }

    async getService(
        providerAddress: string,
        svcName: string
    ): Promise<FineTuneServiceStruct> {
        try {
            return this.serving.getService(providerAddress, svcName)
        } catch (error) {
            throw error
        }
    }

    async ackowledgeProvider(provider : AddressLike) {
        try {
            await this.serving.acknowledgeProviderSigner(provider)
        } catch (error) {
            throw error
        }
    }

    async ackowledgeDeliverable(provider : AddressLike, index : BigNumberish) {
        try {
            await this.serving.acknowledgeDeliverable(provider, index)
        } catch (error) {
            throw error
        }
    }

    getUserAddress(): string {
        return this._userAddress
    }
}

export class InferenceServingContract {
    public serving: InferenceServing
    public signer: JsonRpcSigner | Wallet

    private _userAddress: string

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        userAddress: string
    ) {
        this.serving = InferenceServing__factory.connect(contractAddress, signer)
        this.signer = signer
        this._userAddress = userAddress
    }

    lockTime(): Promise<bigint> {
        return this.serving.lockTime()
    }

    async listService(): Promise<InferenceServiceStruct[]> {
        try {
            const services = await this.serving.getAllServices()
            return services
        } catch (error) {
            throw error
        }
    }

    async listAccount() : Promise<InferenceAccountStruct[]> {
        try {
            return await this.serving.getAllAccounts()
        } catch (error) {
            throw error
        }
    }

    async getAccount(provider: AddressLike) : Promise<InferenceAccountStruct> {
        try {
            const user = this.getUserAddress()
            return await this.serving.getAccount(user, provider)
        } catch (error) {
            throw error
        }
    }

    async deleteAccount(provider: AddressLike) {
        try {
            const tx =
                await this.serving.deleteAccount(this.getUserAddress(), provider)

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                const error = new Error('Inference deleteAccount failed')
                throw error
            }
        } catch (error) {
            throw error
        }
    }

    async addOrUpdateService(
        name: string,
        serviceType : string,
        url: string,
        model: string,
        verifiability : string,
        inputPrice: BigNumberish,
        outputPrice: BigNumberish,
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
                const error = new Error('Inference addOrUpdateService failed')
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
            const tx = await this.serving.addAccount(
                this.getUserAddress(),
                providerAddress,
                signer,
                settleSignerEncryptedPrivateKey,
                {
                    value: balance,
                }
            )

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                throw new Error('Finetuning addAccount failed')
            }
        } catch (error) {
            throw error
        }
    }

    async depositFund(providerAddress: AddressLike, balance: string) {
        try {
            const tx = await this.serving.depositFund(
                this.getUserAddress(),
                providerAddress, {
                    value: balance,
                })

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                throw new Error('Finetuning depositFund failed')
            }
        } catch (error) {
            throw error
        }
    }

    async getService(
        providerAddress: string,
        svcName: string
    ): Promise<InferenceServiceStruct> {
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

export class LedgerContract {
    public ledger: LedgerManager
    public signer: JsonRpcSigner | Wallet

    private readonly _userAddress: string

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        userAddress: string
    ) {
        this.ledger = LedgerManager__factory.connect(contractAddress, signer)
        this.signer = signer
        this._userAddress = userAddress
    }

    async addLedger(
        signer: [BigNumberish, BigNumberish],
        balance: bigint,
        settleSignerEncryptedPrivateKey: string
    ) {
        // todo: what is the meaning for the return [bigint, bigint]?
        try {
            const tx = await this.ledger.addLedger(
                signer,
                settleSignerEncryptedPrivateKey,
                {
                    value: balance,
                }
            )

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                throw new Error('LedgerManager: addLedger failed')
            }
        } catch (error) {
            throw error
        }
    }

    async depositFund(balance : bigint) {
        try {
            const tx = await this.ledger.depositFund(
                {
                    value: balance,
                }
            )

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                throw new Error('LedgerManager: depositFund failed')
            }
        } catch (error) {
            throw error
        }
    }

    async getLedger() : Promise<LedgerStructOutput> {
        try {
            return await this.ledger.getLedger(this.getUserAddress())
        } catch (error) {
            throw error
        }
    }

    async transferFund(providerAddr : AddressLike,
                       serviceType : string,
                       amount : BigNumberish)  {
        try {
            const tx = await this.ledger.transferFund(providerAddr, serviceType, amount);
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                throw new Error('LedgerManager: transferFund failed')
            }

        } catch (error) {
            throw error
        }
    }

    // serviceType: inference or fine-tune
    async retrieveFund(providers : AddressLike[],
                      serviceType : string)  {
        try {
            const tx = await this.ledger.retrieveFund(providers, serviceType);
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                throw new Error('LedgerManager: retrieveFund failed')
            }
        } catch (error) {
            throw error
        }
    }

    async refund(amount : BigNumberish) {
        try {
            const tx = await this.ledger.refund(amount);
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                throw new Error('LedgerManager: refund failed')
            }
        } catch (error) {
            throw error
        }
    }

    getUserAddress(): string {
        return this._userAddress
    }

}

export type ServiceStructOutput = FineTuneServiceStruct | InferenceServiceStruct
