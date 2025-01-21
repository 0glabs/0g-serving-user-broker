import { ServiceStructOutput } from '../contract';
import { BrokerBase } from './base';
export declare class ServiceProcessor extends BrokerBase {
    listService(): Promise<ServiceStructOutput[]>;
    acknowledgeProviderSigner(providerAddress: string, svcName: string): Promise<void>;
    createTask(providerAddress: string, serviceName: string, preTrainedModelName: string, dataSize: number, datasetHash: string, trainingPath: string): Promise<string>;
    getLog(providerAddress: string, serviceName: string, userAddress: string, taskID?: string): Promise<string>;
    private verifyTrainingParams;
}
//# sourceMappingURL=service.d.ts.map