import { ZGServingUserBrokerBase } from './base';
import { AddressLike } from 'ethers';
/**
 * AccountProcessor 包含对 0G Serving Account 的创建，充值和获取的方法。
 */
export declare class AccountProcessor extends ZGServingUserBrokerBase {
    listService(): Promise<import("..").ServiceStructOutput[]>;
    getAccount(user: AddressLike, provider: AddressLike): Promise<import("..").AccountStructOutput>;
    listAccount(): Promise<import("..").AccountStructOutput[]>;
    /**
     * addAccount 创建 0G Serving 账户。
     *
     * @param providerAddress - provider 地址。
     * @param balance - 账户预存金额。
     */
    addAccount(providerAddress: string, balance: string): Promise<void>;
    /**
     * depositFund 给 0G Serving 账户充值。
     *
     * @param providerAddress - provider 地址。
     * @param balance - 充值金额。
     */
    depositFund(providerAddress: string, balance: string): Promise<void>;
    private createAndStoreKey;
}
//# sourceMappingURL=account.d.ts.map