import { AddressLike } from 'ethers';
import { AccountStructOutput, FineTuningServingContract, ServiceStructOutput } from '../contract';
import { Provider, Task } from '../provider/provider';
import { BrokerBase } from './base';
import { LedgerBroker } from '../../ledger';
import { Automata } from '../automata ';
export interface FineTuningAccountDetail {
    account: AccountStructOutput;
    refunds: {
        amount: bigint;
        remainTime: bigint;
    }[];
}
export declare class ServiceProcessor extends BrokerBase {
    protected automata: Automata;
    constructor(contract: FineTuningServingContract, ledger: LedgerBroker, servingProvider: Provider);
    getLockTime(): Promise<bigint>;
    getAccount(provider: AddressLike): Promise<AccountStructOutput>;
    getAccountWithDetail(provider: AddressLike): Promise<FineTuningAccountDetail>;
    listService(): Promise<ServiceStructOutput[]>;
    acknowledgeProviderSigner(providerAddress: string, gasPrice?: number): Promise<void>;
    createTask(providerAddress: string, preTrainedModelName: string, dataSize: number, datasetHash: string, trainingPath: string, gasPrice?: number): Promise<string>;
    listTask(providerAddress: string): Promise<Task[]>;
    getTask(providerAddress: string, taskID?: string): Promise<Task>;
    getLog(providerAddress: string, taskID?: string): Promise<string>;
    modelUsage(providerAddress: string, preTrainedModelName: string, output: string): Promise<void>;
    private verifyTrainingParams;
}
//# sourceMappingURL=service.d.ts.map