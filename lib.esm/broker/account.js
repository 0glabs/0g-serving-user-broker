import { Metadata } from '../storage';
import { ZGServingUserBrokerBase } from './base';
import { createKey } from '../zk';
/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export class AccountProcessor extends ZGServingUserBrokerBase {
    async getAccount(user, provider) {
        try {
            const accounts = await this.contract.getAccount(user, provider);
            return accounts;
        }
        catch (error) {
            throw error;
        }
    }
    async listAccount() {
        try {
            const accounts = await this.contract.listAccount();
            return accounts;
        }
        catch (error) {
            throw error;
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
    async addAccount(providerAddress, balance) {
        let zkSignerPublicKey;
        try {
            zkSignerPublicKey = await this.createAndStoreKey(providerAddress);
        }
        catch (error) {
            throw error;
        }
        try {
            await this.contract.addAccount(providerAddress, zkSignerPublicKey, balance);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * depositFund deposits funds into a 0G Serving account.
     *
     * @param providerAddress - provider address.
     * @param balance - deposit amount.
     */
    async depositFund(providerAddress, balance) {
        try {
            await this.contract.depositFund(providerAddress, balance);
        }
        catch (error) {
            throw error;
        }
    }
    async createAndStoreKey(providerAddress) {
        // [pri, pub]
        let keyPair;
        try {
            keyPair = await createKey();
        }
        catch (error) {
            throw error;
        }
        const key = this.contract.getUserAddress() + providerAddress;
        // private key will be used for signing request
        Metadata.storeZKPrivateKey(key, keyPair[0]);
        // public key will be used to create serving account
        return keyPair[1];
    }
}
//# sourceMappingURL=account.js.map