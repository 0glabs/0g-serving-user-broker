import { ZGServingUserBrokerBase } from './base';
import { AddressLike } from 'ethers';
/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export declare class AccountProcessor extends ZGServingUserBrokerBase {
    getAccount(user: AddressLike, provider: AddressLike): Promise<import("..").AccountStructOutput>;
    listAccount(): Promise<import("..").AccountStructOutput[]>;
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
    addAccount(providerAddress: string, balance: string): Promise<void>;
    /**
     * depositFund deposits funds into a 0G Serving account.
     *
     * @param providerAddress - provider address.
     * @param balance - deposit amount.
     */
    depositFund(providerAddress: string, balance: string): Promise<void>;
    private createAndStoreKey;
}
//# sourceMappingURL=account.d.ts.map