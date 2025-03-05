import {
    JsonRpcSigner,
    BigNumberish,
    AddressLike,
    Wallet,
    ContractTransactionReceipt,
} from 'ethers'
import { LedgerManager, LedgerManager__factory } from './typechain'

export class LedgerManagerContract {
    public ledger: LedgerManager
    public signer: JsonRpcSigner | Wallet

    private _userAddress: string
    private _gasPrice?: number

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        userAddress: string,
        gasPrice?: number
    ) {
        this.ledger = LedgerManager__factory.connect(contractAddress, signer)
        this.signer = signer
        this._userAddress = userAddress
        this._gasPrice = gasPrice
    }

    async addLedger(
        signer: [BigNumberish, BigNumberish],
        balance: bigint,
        settleSignerEncryptedPrivateKey: string,
        gasPrice?: number
    ) {
        try {
            const txOptions: any = { value: balance }
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }

            const tx = await this.ledger.addLedger(
                signer,
                settleSignerEncryptedPrivateKey,
                txOptions
            )

            const receipt = await tx.wait()

            this.checkReceipt(receipt)
        } catch (error) {
            this.detailedError(error)
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

    async depositFund(balance: string, gasPrice?: number) {
        try {
            const txOptions: any = { value: balance }
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            const tx = await this.ledger.depositFund(txOptions)

            const receipt = await tx.wait()

            this.checkReceipt(receipt)
        } catch (error) {
            this.detailedError(error)
        }
    }

    async refund(amount: BigNumberish, gasPrice?: number) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            const tx = await this.ledger.refund(amount, txOptions)

            const receipt = await tx.wait()

            this.checkReceipt(receipt)
        } catch (error) {
            this.detailedError(error)
        }
    }

    async transferFund(
        provider: AddressLike,
        serviceTypeStr: 'inference' | 'fine-tuning',
        amount: BigNumberish,
        gasPrice?: number
    ) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            const tx = await this.ledger.transferFund(
                provider,
                serviceTypeStr,
                amount,
                txOptions
            )

            const receipt = await tx.wait()

            this.checkReceipt(receipt)
        } catch (error) {
            this.detailedError(error)
        }
    }

    async retrieveFund(
        providers: AddressLike[],
        serviceTypeStr: 'inference' | 'fine-tuning',
        gasPrice?: number
    ) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            const tx = await this.ledger.retrieveFund(
                providers,
                serviceTypeStr,
                txOptions
            )

            const receipt = await tx.wait()

            this.checkReceipt(receipt)
        } catch (error) {
            this.detailedError(error)
        }
    }

    async deleteLedger(gasPrice?: number) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            const tx = await this.ledger.deleteLedger(txOptions)

            const receipt = await tx.wait()

            this.checkReceipt(receipt)
        } catch (error) {
            this.detailedError(error)
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

    detailedError(error: any): void {
        if (error.raw_log) {
            throw new Error('Transaction reverted: ' + error.raw_log)
        } else if (error.logs) {
            // append log together
            let log = ''
            error.logs.forEach((l: any) => {
                log += l.log
            })
            throw new Error('Transaction reverted: ' + log)
        } else if (error.log) {
            throw new Error('Transaction reverted: ' + error.log)
        } else if (error.info?.error?.message) {
            throw new Error('Transaction reverted: ' + error.info.error.message)
        }
        throw error
    }
}
