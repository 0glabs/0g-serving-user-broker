import { ZGServingUserBrokerBase } from './base'
import { AddressLike } from 'ethers'

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
}
