import { FineTuningServingContract } from "../contract";
export interface Task {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    customerAddress: string;
    preTrainedModelHash: string;
    datasetHash: string;
    trainingParams: string;
    outputRootHash?: string;
    isTurbo: boolean;
    progress: string;
    fee: string;
    nonce: string;
    signature: string;
    secret: string;
    encryptedSecret: string;
    teeSignature?: string;
}
export declare class Provider {
    private contract;
    constructor(contract: FineTuningServingContract);
    createTask(pretrainedModelName: string, rootHash: string, isTurbo: boolean, providerAddress: string, fee: string, trainingParams: string): Promise<void>;
    getProviderUrl(providerAddress: string, serviceName: string): Promise<string>;
    getTaskProgress(providerAddress: string, serviceName: string, customerAddress: string): Promise<string>;
    getLatestTask(providerAddress: string, serviceName: string, customerAddress: string): Promise<Task>;
}
//# sourceMappingURL=provider.d.ts.map