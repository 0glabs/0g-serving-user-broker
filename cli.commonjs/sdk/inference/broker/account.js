"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountProcessor = void 0;
const base_1 = require("./base");
/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
class AccountProcessor extends base_1.ZGServingUserBrokerBase {
    async getAccount(provider) {
        try {
            return await this.contract.getAccount(provider);
        }
        catch (error) {
            throw error;
        }
    }
    async getAccountWithDetail(provider) {
        try {
            const [account, lockTime] = await Promise.all([
                this.contract.getAccount(provider),
                this.contract.lockTime(),
            ]);
            const now = BigInt(Math.floor(Date.now() / 1000));
            const refunds = account.refunds
                .filter((refund) => !refund.processed)
                .filter((refund) => refund.amount !== BigInt(0))
                .map((refund) => ({
                amount: refund.amount,
                remainTime: lockTime - (now - refund.createdAt),
            }));
            return [account, refunds];
        }
        catch (error) {
            throw error;
        }
    }
    async listAccount() {
        try {
            return await this.contract.listAccount();
        }
        catch (error) {
            throw error;
        }
    }
}
exports.AccountProcessor = AccountProcessor;
//# sourceMappingURL=account.js.map