import { JsonRpcSigner, BigNumberish, AddressLike, Wallet } from 'ethers';
import { LedgerManager } from './typechain';
export declare class LedgerManagerContract {
    ledger: LedgerManager;
    signer: JsonRpcSigner | Wallet;
    private _userAddress;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string, userAddress: string);
    addLedger(signer: [BigNumberish, BigNumberish], balance: bigint, settleSignerEncryptedPrivateKey: string): Promise<void>;
    listLedger(): Promise<import(".").LedgerStructOutput[]>;
    getLedger(): Promise<import(".").LedgerStructOutput>;
    depositFund(balance: string): Promise<void>;
    refund(amount: BigNumberish): Promise<void>;
    transferFund(provider: AddressLike, serviceTypeStr: 'inference' | 'fine-tuning', amount: BigNumberish): Promise<void>;
    retrieveFund(providers: AddressLike[], serviceTypeStr: 'inference' | 'fine-tuning'): Promise<void>;
    deleteLedger(): Promise<void>;
    getUserAddress(): string;
}
//# sourceMappingURL=ledger.d.ts.map