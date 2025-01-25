import { ZGServingUserBrokerBase } from './base'
import { genKeyPair } from '../../common/settle-signer'
import { AddressLike } from 'ethers'
import { encryptData, privateKeyToStr } from '../../common/utils'

/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export class AccountProcessor extends ZGServingUserBrokerBase {
    async getAccount(provider: AddressLike) {
        try {
            return await this.contract.getAccount(provider)
        } catch (error) {
            throw error
        }
    }

    async listAccount() {
        try {
            return await this.contract.listAccount()
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
            const key = this.contract.getUserAddress()

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
}
