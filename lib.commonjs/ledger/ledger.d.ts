import { AddressLike } from 'ethers';
import { LedgerManagerContract } from './contract';
import { InferenceServingContract } from '../inference/contract';
import { FineTuningServingContract } from '../fine-tuning/contract';
import { Cache, Metadata } from '../common/storage';
export interface LedgerDetailStructOutput {
    ledgerInfo: bigint[];
    infers: [string, bigint, bigint][];
    fines: [string, bigint, bigint][] | null;
}
/**
 * LedgerProcessor contains methods for creating, depositing funds, and retrieving 0G Compute Network Ledgers.
 */
export declare class LedgerProcessor {
    protected metadata: Metadata;
    protected cache: Cache;
    protected ledgerContract: LedgerManagerContract;
    protected inferenceContract: InferenceServingContract;
    protected fineTuningContract: FineTuningServingContract | undefined;
    constructor(metadata: Metadata, cache: Cache, ledgerContract: LedgerManagerContract, inferenceContract: InferenceServingContract, fineTuningContract?: FineTuningServingContract);
    getLedger(): Promise<import("./contract").LedgerStructOutput>;
    getLedgerWithDetail(): Promise<LedgerDetailStructOutput>;
    listLedger(): Promise<import("./contract").LedgerStructOutput[]>;
    addLedger(balance: number, gasPrice?: number): Promise<void>;
    deleteLedger(gasPrice?: number): Promise<void>;
    depositFund(balance: number, gasPrice?: number): Promise<void>;
    refund(balance: number, gasPrice?: number): Promise<void>;
    transferFund(to: AddressLike, serviceTypeStr: 'inference' | 'fine-tuning', balance: bigint, gasPrice?: number): Promise<void>;
    retrieveFund(serviceTypeStr: 'inference' | 'fine-tuning', gasPrice?: number): Promise<void>;
    private createSettleSignerKey;
    protected a0giToNeuron(value: number): bigint;
    protected neuronToA0gi(value: bigint): number;
}
//# sourceMappingURL=ledger.d.ts.map