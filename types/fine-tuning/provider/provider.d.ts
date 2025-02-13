import { FineTuningServingContract } from '../contract';
export interface Task {
    readonly id?: string;
    readonly createdAt?: string;
    readonly updatedAt?: string;
    userAddress: string;
    preTrainedModelHash: string;
    datasetHash: string;
    trainingParams: string;
    fee: string;
    nonce: string;
    signature: string;
    readonly progress?: string;
    readonly deliverIndex?: string;
}
export interface QuoteResponse {
    quote: string;
    provider_signer: string;
}
export declare class Provider {
    private contract;
    constructor(contract: FineTuningServingContract);
    private fetchJSON;
    private fetchText;
    getProviderUrl(providerAddress: string): Promise<string>;
    getQuote(providerAddress: string): Promise<QuoteResponse>;
    createTask(providerAddress: string, task: Task): Promise<string>;
    getTask(providerAddress: string, userAddress: string, taskID: string): Promise<Task>;
    listTask(providerAddress: string, userAddress: string, latest?: boolean): Promise<Task[]>;
    getLog(providerAddress: string, userAddress: string, taskID: string): Promise<string>;
}
//# sourceMappingURL=provider.d.ts.map