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
    constructor(signer: Wallet, fineTuningCA: string, ledger: LedgerBroker);
    initialize(): Promise<void>;
    listService: () => Promise<import("..").FineTuningServiceStructOutput[]>;
    getLockedTime: () => Promise<bigint>;
    getAccount: (providerAddress: string) => Promise<import("../contract").AccountStructOutput>;
    getAccountWithDetail: (providerAddress: string) => Promise<FineTuningAccountDetail>;
    acknowledgeProviderSigner: (providerAddress: string) => Promise<void>;
    listModel: () => [string, {
        [key: string]: string;
    }][];
    uploadDataset: (dataPath: string) => Promise<void>;
    downloadDataset: (dataPath: string, dataRoot: string) => Promise<void>;
    createTask: (providerAddress: string, preTrainedModelName: string, dataSize: number, datasetHash: string, trainingPath: string) => Promise<string>;
    getTask: (providerAddress: string, taskID?: string) => Promise<Task>;
    getLog: (providerAddress: string, taskID?: string) => Promise<string>;
    acknowledgeModel: (providerAddress: string, dataPath: string) => Promise<void>;
    decryptModel: (providerAddress: string, encryptedModelPath: string, decryptedModelPath: string) => Promise<void>;
}
/**
 * createFineTuningBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
export declare function createFineTuningBroker(signer: Wallet, contractAddress: string | undefined, ledger: LedgerBroker): Promise<FineTuningBroker>;
//# sourceMappingURL=broker.d.ts.map