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
        // 1 A0GI = 10^18 neuron
        const scaledValue = value * 10 ** 18

        if (!Number.isSafeInteger(scaledValue)) {
            throw new Error('Input number is too small.')
        }

        return BigInt(scaledValue)
    }

    private neuronToA0gi(value: bigint): number {
        const divisor = BigInt(10 ** 18)
        const integerPart = value / divisor
        const remainder = value % divisor
        const decimalPart = Number(remainder) / Number(divisor)

        return Number(integerPart) + decimalPart
    }
}
