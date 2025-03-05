import { JsonRpcSigner, BigNumberish, AddressLike, Wallet, ContractTransactionReceipt } from 'ethers';
import { LedgerManager } from './typechain';
export declare class LedgerManagerContract {
    ledger: LedgerManager;
    signer: JsonRpcSigner | Wallet;
    private _userAddress;
    private _gasPrice?;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string, userAddress: string, gasPrice?: number);
    addLedger(signer: [BigNumberish, BigNumberish], balance: bigint, settleSignerEncryptedPrivateKey: string, gasPrice?: number): Promise<void>;
    listLedger(): Promise<import(".").LedgerStructOutput[]>;
    getLedger(): Promise<import(".").LedgerStructOutput>;
    depositFund(balance: string, gasPrice?: number): Promise<void>;
    refund(amount: BigNumberish, gasPrice?: number): Promise<void>;
    transferFund(provider: AddressLike, serviceTypeStr: 'inference' | 'fine-tuning', amount: BigNumberish, gasPrice?: number): Promise<void>;
    retrieveFund(providers: AddressLike[], serviceTypeStr: 'inference' | 'fine-tuning', gasPrice?: number): Promise<void>;
    deleteLedger(gasPrice?: number): Promise<void>;
    getUserAddress(): string;
    checkReceipt(receipt: ContractTransactionReceipt | null): void;
    detailedError(error: any): void;
}
//# sourceMappingURL=ledger.d.ts.map