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
    wait?: boolean;
}
export interface QuoteResponse {
    quote: string;
    provider_signer: string;
}
export interface CustomizedModel {
    name: string;
    hash: string;
    image: string;
    dataType: string;
    trainingScript: string;
    description: string;
    tokenizer: string;
}
export declare class Provider {
    private contract;
    constructor(contract: FineTuningServingContract);
    private fetchJSON;
    private fetchText;
    getProviderUrl(providerAddress: string): Promise<string>;
    getQuote(providerAddress: string): Promise<QuoteResponse>;
    createTask(providerAddress: string, task: Task): Promise<string>;
    cancelTask(providerAddress: string, signature: string, taskID: string): Promise<string>;
    getTask(providerAddress: string, userAddress: string, taskID: string): Promise<Task>;
    listTask(providerAddress: string, userAddress: string, latest?: boolean): Promise<Task[]>;
    getPendingTaskCounter(providerAddress: string): Promise<number>;
    getLog(providerAddress: string, userAddress: string, taskID: string): Promise<string>;
    getCustomizedModels(url: string): Promise<CustomizedModel[]>;
    getCustomizedModel(providerAddress: string, moduleName: string): Promise<CustomizedModel>;
    getCustomizedModelDetailUsage(providerAddress: string, moduleName: string, outputPath: string): Promise<void>;
}
//# sourceMappingURL=provider.d.ts.map