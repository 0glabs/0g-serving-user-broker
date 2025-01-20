import { ServiceStructOutput } from '../contract';
import { BrokerBase } from './base';
export interface CreateTaskArgs {
    preTrainedModelName: string;
    datasetRootHash: string;
    isTurbo: boolean;
    providerAddress: string;
    dataSize: number;
}
export declare class ServiceProcessor extends BrokerBase {
    listService(): Promise<ServiceStructOutput[]>;
    acknowledgeProviderSigner(): Promise<void>;
    createTask(preTrainedModelName: string, dataSize: number, rootHash: string, isTurbo: boolean, providerAddress: string, serviceName: string, trainingPath: string): Promise<void>;
    getTaskProgress(providerAddress: string, serviceName: string, customerAddress: string): Promise<string>;
}
//# sourceMappingURL=service.d.ts.map