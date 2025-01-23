import { AddressLike } from 'ethers'
import { genKeyPair } from '../common/settle-signer'
import { encryptData, privateKeyToStr } from '../common/utils'
import { Metadata } from '../common/storage'
import { LedgerManagerContract } from './contract'
import { InferenceServingContract } from '../inference/contract'
import { FineTuningServingContract } from '../fine-tuning/contract'

export interface LedgerDetailStructOutput {
    ledgerInfo: number[]
    infers: (string | number)[][]
    fines: (string | number)[][] | null
}
/**
 * LedgerProcessor contains methods for creating, depositing funds, and retrieving 0G Compute Network Ledgers.
 */
export class LedgerProcessor {
    protected metadata: Metadata
    protected ledgerContract: LedgerManagerContract
    protected inferenceContract: InferenceServingContract
    protected fineTuningContract: FineTuningServingContract | undefined

    constructor(
        metadata: Metadata,
        ledgerContract: LedgerManagerContract,
        inferenceContract: InferenceServingContract,
        fineTuningContract?: FineTuningServingContract
    ) {
        this.metadata = metadata
        this.ledgerContract = ledgerContract
        this.inferenceContract = inferenceContract
        this.fineTuningContract = fineTuningContract
    }

    async getLedger() {
        try {
            const ledger = await this.ledgerContract.getLedger()
            return ledger
        } catch (error) {
            throw error
        }
    }

    async getLedgerWithDetail(): Promise<LedgerDetailStructOutput> {
        try {
            const ledger = await this.ledgerContract.getLedger()
            const ledgerInfo = [
                this.neuronToA0gi(ledger.totalBalance),
                this.neuronToA0gi(ledger.availableBalance),
            ]
            const infers = await Promise.all(
                ledger.inferenceProviders.map(async (provider) => {
                    const account = await this.inferenceContract.getAccount(
                        provider
                    )
                    return [
                        provider,
                        this.neuronToA0gi(account.balance),
                        this.neuronToA0gi(account.pendingRefund),
                    ]
                })
            )

            let fines: (string | number)[][] | null = []
            if (typeof ledger.fineTuningProviders !== 'undefined') {
                fines = await Promise.all(
                    ledger.fineTuningProviders.map(async (provider) => {
                        const account =
                            await this.fineTuningContract?.getAccount(provider)
                        return [
                            provider,
                            this.neuronToA0gi(account!.balance),
                            this.neuronToA0gi(account!.pendingRefund),
                        ]
                    })
                )
            }

            return { ledgerInfo, infers, fines }
        } catch (error) {
            throw error
        }
    }

    async listLedger() {
        try {
            const ledgers = await this.ledgerContract.listLedger()
            return ledgers
        } catch (error) {
            throw error
        }
    }

    async addLedger(balance: number) {
        try {
            try {
                const ledger = await this.getLedger()
                if (ledger) {
                    throw new Error(
                        'Ledger already exists, with balance: ' +
                            this.neuronToA0gi(ledger.totalBalance) +
                            ' A0GI'
                    )
                }
            } catch (error) {
                if (!(error as any).message.includes('LedgerNotExists')) {
                    throw error
                }
            }

            const { settleSignerPublicKey, settleSignerEncryptedPrivateKey } =
                await this.createSettleSignerKey()

            await this.ledgerContract.addLedger(
                settleSignerPublicKey,
                this.a0giToNeuron(balance),
                settleSignerEncryptedPrivateKey
            )
        } catch (error) {
            throw error
        }
    }

    async deleteLedger() {
        try {
            await this.ledgerContract.deleteLedger()
        } catch (error) {
            throw error
        }
    }

    async depositFund(balance: number) {
        try {
            const amount = this.a0giToNeuron(balance).toString()
            await this.ledgerContract.depositFund(amount)
        } catch (error) {
            throw error
        }
    }

    async refund(balance: number) {
        try {
            const amount = this.a0giToNeuron(balance).toString()
            await this.ledgerContract.refund(amount)
        } catch (error) {
            throw error
        }
    }

    async transferFund(
        to: AddressLike,
        serviceTypeStr: 'inference' | 'fine-tuning',
        balance: bigint
    ) {
        try {
            const amount = balance.toString()
            await this.ledgerContract.transferFund(to, serviceTypeStr, amount)
        } catch (error) {
            throw error
        }
    }

    async retrieveFund(
        providers: AddressLike[],
        serviceTypeStr: 'inference' | 'fine-tuning'
    ) {
        try {
            await this.ledgerContract.retrieveFund(providers, serviceTypeStr)
        } catch (error) {
            throw error
        }
    }

    private async createSettleSignerKey(): Promise<{
        settleSignerPublicKey: [bigint, bigint]
        settleSignerEncryptedPrivateKey: string
    }> {
        try {
            // [pri, pub]
            const keyPair = await genKeyPair()
            const key = `${this.ledgerContract.getUserAddress()}`

            this.metadata.storeSettleSignerPrivateKey(
                key,
                keyPair.packedPrivkey
            )

            const settleSignerEncryptedPrivateKey = await encryptData(
                this.ledgerContract.signer,
                privateKeyToStr(keyPair.packedPrivkey)
            )

            return {
                settleSignerEncryptedPrivateKey,
                settleSignerPublicKey: keyPair.doublePackedPubkey,
            }
        } catch (error) {
            throw error
        }
    }

    protected a0giToNeuron(value: number): bigint {
        const valueStr = value.toFixed(18)
        const parts = valueStr.split('.')

        // Handle integer part
        const integerPart = parts[0]
        let integerPartAsBigInt = BigInt(integerPart) * BigInt(10 ** 18)

        // Handle fractional part if it exists
        if (parts.length > 1) {
            let fractionalPart = parts[1]
            while (fractionalPart.length < 18) {
                fractionalPart += '0'
            }
            if (fractionalPart.length > 18) {
                fractionalPart = fractionalPart.slice(0, 18) // Truncate to avoid overflow
            }

            const fractionalPartAsBigInt = BigInt(fractionalPart)
            integerPartAsBigInt += fractionalPartAsBigInt
        }

        return integerPartAsBigInt
    }

    protected neuronToA0gi(value: bigint): number {
        const divisor = BigInt(10 ** 18)
        const integerPart = value / divisor
        const remainder = value % divisor
        const decimalPart = Number(remainder) / Number(divisor)

        return Number(integerPart) + decimalPart
    }
}
