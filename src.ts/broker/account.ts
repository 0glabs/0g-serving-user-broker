import { ZGServingUserBrokerBase } from './base'
import { genKeyPair } from '../settle-signer'
import { AddressLike } from 'ethers'
import { encryptData, settlePrivateKeyToString } from '../utils/encrypt'

/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export class AccountProcessor extends ZGServingUserBrokerBase {
    async getAccount(provider: AddressLike) {
        try {
            const accounts = await this.contract.getAccount(provider)
            return accounts
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

    async addAccount(providerAddress: string, balance: string) {
        try {
            try {
                const account = await this.getAccount(providerAddress)
                if (account) {
                    throw new Error(
                        'Account already exists, with balance: ' +
                            account.balance
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
                balance,
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

    async depositFund(providerAddress: string, balance: string) {
        try {
            await this.contract.depositFund(providerAddress, balance)
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
                settlePrivateKeyToString(keyPair.packedPrivkey)
            )

            return {
                settleSignerEncryptedPrivateKey,
                settleSignerPublicKey: keyPair.doublePackedPubkey,
            }
        } catch (error) {
            throw error
        }
    }
}
