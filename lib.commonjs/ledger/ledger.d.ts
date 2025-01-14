import { AddressLike } from 'ethers';
import { Metadata } from '../common/storage';
import { LedgerManagerContract } from '../contract/ledger';
/**
 * LedgerProcessor contains methods for creating, depositing funds, and retrieving 0G Compute Network Ledgers.
 */
export declare class LedgerProcessor {
    protected ledgerContract: LedgerManagerContract;
    protected metadata: Metadata;
    constructor(ledgerContract: LedgerManagerContract, metadata: Metadata);
    getLedger(): Promise<import("../contract/ledger").LedgerStructOutput>;
    listLedger(): Promise<import("../contract/ledger").LedgerStructOutput[]>;
    addLedger(balance: number): Promise<void>;
    deleteLedger(): Promise<void>;
    depositFund(balance: number): Promise<void>;
    refund(balance: number): Promise<void>;
    transferFund(to: AddressLike, serviceTypeStr: 'inference' | 'fine-tuning', balance: number): Promise<void>;
    retrieveFund(providers: AddressLike[], serviceTypeStr: 'inference' | 'fine-tuning'): Promise<void>;
    private createSettleSignerKey;
    protected a0giToNeuron(value: number): bigint;
    protected neuronToA0gi(value: bigint): number;
}
//# sourceMappingURL=ledger.d.ts.map