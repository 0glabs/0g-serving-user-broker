import { JsonRpcSigner, Wallet } from 'ethers';
import { LedgerBroker } from '../../ledger';
export declare class FineTuningBroker {
    private signer;
    private fineTuningCA;
    private ledger;
    private modelProcessor;
    private serviceProcessor;
    constructor(signer: JsonRpcSigner | Wallet, fineTuningCA: string, ledger: LedgerBroker);
    initialize(): Promise<void>;
    listService: () => Promise<import("../contract").ServiceStructOutput[]>;
    acknowledgeProviderSigner: () => Promise<void>;
    uploadDataset: () => Promise<string>;
    createTask: () => Promise<void>;
    getTaskProgress: () => Promise<string>;
    acknowledgeModel: () => Promise<void>;
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
export declare function createFineTuningBroker(signer: JsonRpcSigner | Wallet, contractAddress: string | undefined, ledger: LedgerBroker): Promise<FineTuningBroker>;
//# sourceMappingURL=broker.d.ts.map