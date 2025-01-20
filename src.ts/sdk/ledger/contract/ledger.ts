import { JsonRpcSigner, BigNumberish, AddressLike, Wallet } from 'ethers'
import { LedgerManager, LedgerManager__factory } from './typechain'

export class LedgerManagerContract {
    public ledger: LedgerManager
    public signer: JsonRpcSigner | Wallet

    private _userAddress: string

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
                const error = new Error('Transaction failed')
                throw error
            }
        } catch (error) {
            throw error
        }
    }

    async listLedger() {
        try {
            const ledgers = await this.ledger.getAllLedgers()
            return ledgers
        } catch (error) {
            throw error
        }
    }

    async getLedger() {
        try {
            const user = this.getUserAddress()
            const ledger = await this.ledger.getLedger(user)
            return ledger
        } catch (error) {
            throw error
        }
    }

    async depositFund(balance: string) {
        try {
            const tx = await this.ledger.depositFund({
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

    async refund(amount: BigNumberish) {
        try {
            const tx = await this.ledger.refund(amount)

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed')
                throw error
            }
        } catch (error) {
            throw error
        }
    }

    async transferFund(
        provider: AddressLike,
        serviceTypeStr: 'inference' | 'fine-tuning',
        amount: BigNumberish
    ) {
        try {
            const tx = await this.ledger.transferFund(
                provider,
                serviceTypeStr,
                amount
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

    async retrieveFund(
        providers: AddressLike[],
        serviceTypeStr: 'inference' | 'fine-tuning'
    ) {
        try {
            const tx = await this.ledger.retrieveFund(providers, serviceTypeStr)

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed')
                throw error
            }
        } catch (error) {
            throw error
        }
    }

    async deleteLedger() {
        try {
            const tx = await this.ledger.deleteLedger()

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed')
                throw error
            }
        } catch (error) {
            throw error
        }
    }

    getUserAddress(): string {
        return this._userAddress
    }
}
