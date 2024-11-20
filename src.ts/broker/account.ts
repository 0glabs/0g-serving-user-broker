import { ZGServingUserBrokerBase } from './base'
import { genKeyPair } from '../zk'
import { AddressLike } from 'ethers'

/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export class AccountProcessor extends ZGServingUserBrokerBase {
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
     * Adds a new account to the contract.
     *
     * This function performs the following steps:
     * 1. Creates and stores a key pair for the given provider address.
     * 2. Adds the account to the contract using the provider address, the generated public pair, and the specified balance.
     *
     * @param providerAddress - The address of the provider for whom the account is being created.
     * @param balance - The initial balance to be assigned to the new account.
     *
     * @remarks
     * When creating an account, a key pair is also created to sign the request.
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
     * depositFund deposits funds into a 0G Serving account.
     *
     * @param providerAddress - provider address.
     * @param balance - deposit amount.
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
        try {
            // [pri, pub]
            const keyPair = await genKeyPair()
            const key = `${this.contract.getUserAddress()}_${providerAddress}`
            // private key will be used for signing request
            this.metadata.storeZKPrivateKey(key, keyPair.packedPrivkey)
            // public key will be used to create serving account
            return keyPair.doublePackedPubkey
        } catch (error) {
            throw error
        }
    }
}
