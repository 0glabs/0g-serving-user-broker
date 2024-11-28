import { ZGServingUserBrokerBase } from './base'
import { genKeyPair } from '../settle-signer'
import { AddressLike } from 'ethers'
import { encryptData, privateKeyToStr } from '../utils'

/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export class AccountProcessor extends ZGServingUserBrokerBase {
    async getAccount(provider: AddressLike) {
        try {
            const account = await this.contract.getAccount(provider)
            return account
        } catch (error) {
            throw error
        }
    }

    async listAccount() {
        try {
            const accounts = await this.contract.listAccount()
            return accounts
        } catch (error) {
            throw error
        }
    }

    async addAccount(providerAddress: string, balance: number) {
        try {
            try {
                const account = await this.getAccount(providerAddress)
                if (account) {
                    throw new Error(
                        'Account already exists, with balance: ' +
                            this.neuronToA0gi(account.balance) +
                            ' A0GI'
                    )
                }
            } catch (error) {
                if (!(error as any).message.includes('AccountNotexists')) {
                    throw error
                }
            }

            const { settleSignerPublicKey, settleSignerEncryptedPrivateKey } =
                await this.createSettleSignerKey(providerAddress)

            await this.contract.addAccount(
                providerAddress,
                settleSignerPublicKey,
                this.a0giToNeuron(balance),
                settleSignerEncryptedPrivateKey
            )
        } catch (error) {
            throw error
        }
    }

    async deleteAccount(provider: AddressLike) {
        try {
            await this.contract.deleteAccount(provider)
        } catch (error) {
            throw error
        }
    }

    async depositFund(providerAddress: string, balance: number) {
        try {
            const amount = this.a0giToNeuron(balance).toString()
            await this.contract.depositFund(providerAddress, amount)
        } catch (error) {
            throw error
        }
    }

    private async createSettleSignerKey(providerAddress: string): Promise<{
        settleSignerPublicKey: [bigint, bigint]
        settleSignerEncryptedPrivateKey: string
    }> {
        try {
            // [pri, pub]
            const keyPair = await genKeyPair()
            const key = `${this.contract.getUserAddress()}_${providerAddress}`

            this.metadata.storeSettleSignerPrivateKey(
                key,
                keyPair.packedPrivkey
            )

            const settleSignerEncryptedPrivateKey = await encryptData(
                this.contract.signer,
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

    private a0giToNeuron(value: number): bigint {
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

    private neuronToA0gi(value: bigint): number {
        const divisor = BigInt(10 ** 18)
        const integerPart = value / divisor
        const remainder = value % divisor
        const decimalPart = Number(remainder) / Number(divisor)

        return Number(integerPart) + decimalPart
    }
}
