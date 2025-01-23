import { AddressLike } from 'ethers';
import { ServiceStructOutput } from '../contract';
import { Task } from '../provider/provider';
import { BrokerBase } from './base';
export declare class ServiceProcessor extends BrokerBase {
    getAccount(provider: AddressLike): Promise<import("../contract").AccountStructOutput>;
    listService(): Promise<ServiceStructOutput[]>;
    acknowledgeProviderSigner(providerAddress: string, svcName: string): Promise<void>;
    createTask(providerAddress: string, serviceName: string, preTrainedModelName: string, dataSize: number, datasetHash: string, trainingPath: string): Promise<string>;
    getTask(providerAddress: string, serviceName: string, taskID?: string): Promise<Task>;
    getLog(providerAddress: string, serviceName: string, taskID?: string): Promise<string>;
    private verifyTrainingParams;
}
//# sourceMappingURL=service.d.ts.map