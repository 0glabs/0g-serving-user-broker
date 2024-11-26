import { ZGServingUserBrokerBase } from './base';
import { AddressLike } from 'ethers';
/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export declare class AccountProcessor extends ZGServingUserBrokerBase {
    getAccount(provider: AddressLike): Promise<import("..").AccountStructOutput>;
    listAccount(): Promise<import("..").AccountStructOutput[]>;
    addAccount(providerAddress: string, balance: number): Promise<void>;
    deleteAccount(provider: AddressLike): Promise<void>;
    depositFund(providerAddress: string, balance: number): Promise<void>;
    private createSettleSignerKey;
    private a0giToNeuron;
    private neuronToA0gi;
}
//# sourceMappingURL=account.d.ts.map