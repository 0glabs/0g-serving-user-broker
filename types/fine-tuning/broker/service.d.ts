import { AddressLike } from 'ethers';
import { AccountStructOutput, ServiceStructOutput } from '../contract';
import { Task } from '../provider/provider';
import { BrokerBase } from './base';
export interface FineTuningAccountDetail {
    account: AccountStructOutput;
    refunds: {
        amount: bigint;
        remainTime: bigint;
    }[];
}
export declare class ServiceProcessor extends BrokerBase {
    getLockTime(): Promise<bigint>;
    getAccount(provider: AddressLike): Promise<AccountStructOutput>;
    getAccountWithDetail(provider: AddressLike): Promise<FineTuningAccountDetail>;
    listService(): Promise<ServiceStructOutput[]>;
    acknowledgeProviderSigner(providerAddress: string, gasPrice?: number): Promise<void>;
    createTask(providerAddress: string, preTrainedModelName: string, dataSize: number, datasetHash: string, trainingPath: string, gasPrice?: number): Promise<string>;
    getTask(providerAddress: string, taskID?: string): Promise<Task>;
    getLog(providerAddress: string, taskID?: string): Promise<string>;
    private verifyTrainingParams;
}
//# sourceMappingURL=service.d.ts.map