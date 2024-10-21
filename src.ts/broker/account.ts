import { Metadata } from '../storage'
import { ZGServingUserBrokerBase } from './base'
import { createKey } from '../zk'
import { AddressLike } from 'ethers'

/**
 * AccountProcessor 包含对 0G Serving Account 的创建，充值和获取的方法。
 */
export class AccountProcessor extends ZGServingUserBrokerBase {
    async listService() {
        try {
            const services = await this.contract.listService()
            return services
        } catch (error) {
            console.error('List Service Error:', error)
            throw error
        }
    }

    async getAccount(user: AddressLike, provider: AddressLike) {
        try {
            const accounts = await this.contract.getAccount(user, provider)
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

    /**
     * addAccount 创建 0G Serving 账户。
     *
     * @param providerAddress - provider 地址。
     * @param balance - 账户预存金额。
     */
    async addAccount(providerAddress: string, balance: string) {
        let zkSignerPublicKey: [bigint, bigint]
        try {
            zkSignerPublicKey = await this.createAndStoreKey(providerAddress)
        } catch (error) {
            throw error
        }

        try {
            await this.contract.addAccount(
                providerAddress,
                zkSignerPublicKey,
                balance
            )
        } catch (error) {
            throw error
        }
    }

    /**
     * depositFund 给 0G Serving 账户充值。
     *
     * @param providerAddress - provider 地址。
     * @param balance - 充值金额。
     */
    async depositFund(providerAddress: string, balance: string) {
        try {
            await this.contract.depositFund(providerAddress, balance)
        } catch (error) {
            throw error
        }
    }

    private async createAndStoreKey(
        providerAddress: string
    ): Promise<[bigint, bigint]> {
        // [pri, pub]
        let keyPair: [[bigint, bigint], [bigint, bigint]]
        try {
            keyPair = await createKey()
        } catch (error) {
            throw error
        }
        const key = this.contract.getUserAddress() + providerAddress
        // private key will be used for signing request
        Metadata.storeZKPrivateKey(key, keyPair[0])
        // public key will be used to create serving account
        return keyPair[1]
    }
}
