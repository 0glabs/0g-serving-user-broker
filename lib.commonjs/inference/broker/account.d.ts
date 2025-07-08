import type { AccountStructOutput } from '../contract';
import { ZGServingUserBrokerBase } from './base';
import type { AddressLike } from 'ethers';
/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
export declare class AccountProcessor extends ZGServingUserBrokerBase {
    getAccount(provider: AddressLike): Promise<AccountStructOutput>;
    getAccountWithDetail(provider: AddressLike): Promise<[
        AccountStructOutput,
        {
            amount: bigint;
            remainTime: bigint;
        }[]
    ]>;
    listAccount(): Promise<AccountStructOutput[]>;
}
//# sourceMappingURL=account.d.ts.map