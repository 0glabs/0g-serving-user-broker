import { Wallet } from 'ethers';
import { FineTuningAccountDetail } from './service';
import { LedgerBroker } from '../../ledger';
import { Task } from '../provider/provider';
export declare class FineTuningBroker {
    private signer;
    private fineTuningCA;
    private ledger;
    private modelProcessor;
    private serviceProcessor;
    private serviceProvider;
    private _gasPrice?;
    constructor(signer: Wallet, fineTuningCA: string, ledger: LedgerBroker, gasPrice?: number);
    initialize(): Promise<void>;
    listService: () => Promise<import("../contract").ServiceStructOutput[]>;
    getLockedTime: () => Promise<bigint>;
    getAccount: (providerAddress: string) => Promise<import("../contract").AccountStructOutput>;
    getAccountWithDetail: (providerAddress: string) => Promise<FineTuningAccountDetail>;
    acknowledgeProviderSigner: (providerAddress: string, gasPrice?: number) => Promise<void>;
    listModel: () => [string, {
        [key: string]: string;
    }][];
    uploadDataset: (dataPath: string, usePython: boolean, gasPrice?: number, preTrainedModelName?: string) => Promise<void>;
    downloadDataset: (dataPath: string, dataRoot: string) => Promise<void>;
    createTask: (providerAddress: string, preTrainedModelName: string, datasetHash: string, trainingPath: string, usePython: boolean, dataSize?: number, gasPrice?: number, datasetPath?: string) => Promise<string>;
    listTask: (providerAddress: string) => Promise<Task[]>;
    getTask: (providerAddress: string, taskID?: string) => Promise<Task>;
    getLog: (providerAddress: string, taskID?: string) => Promise<string>;
    acknowledgeModel: (providerAddress: string, dataPath: string, gasPrice?: number) => Promise<void>;
    decryptModel: (providerAddress: string, encryptedModelPath: string, decryptedModelPath: string) => Promise<void>;
}
/**
 * createFineTuningBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 * @param ledger - Ledger broker instance.
 * @param gasPrice - Gas price for transactions. If not provided, the gas price will be calculated automatically.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
export declare function createFineTuningBroker(signer: Wallet, contractAddress: string, ledger: LedgerBroker, gasPrice?: number): Promise<FineTuningBroker>;
//# sourceMappingURL=broker.d.ts.map