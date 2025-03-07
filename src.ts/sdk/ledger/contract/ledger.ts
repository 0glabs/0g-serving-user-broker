import {
    JsonRpcSigner,
    BigNumberish,
    AddressLike,
    Wallet,
    ContractTransactionResponse,
    ContractMethodArgs,
} from 'ethers'
import { LedgerManager, LedgerManager__factory } from './typechain'

// Define which errors to retry on
const RETRY_ERROR_SUBSTRINGS = [
    'transaction underpriced',
    'replacement transaction underpriced',
    'fee too low',
    'mempool',
    'timeout',
]

export class LedgerManagerContract {
    public ledger: LedgerManager
    public signer: JsonRpcSigner | Wallet

    private _userAddress: string
    private _gasPrice?: number
    private _maxGasPrice?: number

    constructor(
        signer: JsonRpcSigner | Wallet,
        contractAddress: string,
        userAddress: string,
        gasPrice?: number,
        maxGasPrice?: number
    ) {
        this.ledger = LedgerManager__factory.connect(contractAddress, signer)
        this.signer = signer
        this._userAddress = userAddress
        this._gasPrice = gasPrice
        this._maxGasPrice = maxGasPrice
    }

    async sendTx(
        name: string,
        txArgs: ContractMethodArgs<any[]>,
        txOptions: any
    ): Promise<ContractTransactionResponse> {
        if (this._maxGasPrice === undefined) {
            console.log('sending tx with gas', txOptions.gasPrice)
            return await this.ledger.getFunction(name)(...txArgs, txOptions)
        }
        while (true) {
            try {
                console.log('sending tx with gas', txOptions.gasPrice)
                return await this.ledger.getFunction(name)(...txArgs, txOptions)
            } catch (error: any) {
                let errorMessage = ''
                if (error.info?.error?.message) {
                    errorMessage = error.info.error.message
                }
                const shouldRetry = RETRY_ERROR_SUBSTRINGS.some((substr) =>
                    errorMessage.includes(substr)
                )

                // If it's not a known "underpriced" error, rethrow immediately
                if (!shouldRetry) {
                    throw error
                }
                let currentGasPrice = txOptions.gasPrice
                if (currentGasPrice >= this._maxGasPrice) {
                    throw error
                }
                currentGasPrice = currentGasPrice * 1.1
                if (currentGasPrice > this._maxGasPrice) {
                    currentGasPrice = this._maxGasPrice
                }
                txOptions.gasPrice = currentGasPrice
            }
        }
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

            const tx = await this.sendTx(
                'addLedger',
                [signer, settleSignerEncryptedPrivateKey],
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
            const tx = await this.sendTx('depositFund', [], txOptions)

            const receipt = await tx.wait()

            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed')
                throw error
            }
        } catch (error) {
            throw error
        }
    }

    async refund(amount: BigNumberish, gasPrice?: number) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            const tx = await this.sendTx('refund', [amount], txOptions)

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
        amount: BigNumberish,
        gasPrice?: number
    ) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            const tx = await this.sendTx(
                'transferFund',
                [provider, serviceTypeStr, amount],
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
            const tx = await this.sendTx(
                'retrieveFund',
                [providers, serviceTypeStr],
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

    async deleteLedger(gasPrice?: number) {
        try {
            const txOptions: any = {}
            if (gasPrice || this._gasPrice) {
                txOptions.gasPrice = gasPrice || this._gasPrice
            }
            const tx = await this.sendTx('deleteLedger', [], txOptions)

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
