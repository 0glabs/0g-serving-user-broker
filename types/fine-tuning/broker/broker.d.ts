import { Wallet } from 'ethers';
import { LedgerBroker } from '../../ledger';
export declare class FineTuningBroker {
    private signer;
    private fineTuningCA;
    private ledger;
    private modelProcessor;
    private serviceProcessor;
    private zgClient;
    private serviceProvider;
    constructor(signer: Wallet, fineTuningCA: string, ledger: LedgerBroker);
    initialize(): Promise<void>;
    listService: () => Promise<import("../contract").ServiceStructOutput[]>;
    acknowledgeProviderSigner: () => Promise<void>;
    uploadDataset: (dataPath: string) => Promise<string>;
    createTask: (preTrainedModelName: string, dataSize: number, rootHash: string, isTurbo: boolean, providerAddress: string, serviceName: string, trainingPath: string) => Promise<void>;
    getTaskProgress: (providerAddress: string, serviceName: string) => Promise<string>;
    acknowledgeModel: (providerAddress: string, dataPath: string) => Promise<void>;
    decryptModel: () => Promise<void>;
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