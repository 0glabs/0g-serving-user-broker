import { ServiceStructOutput } from '../contract';
import { BrokerBase } from './base';
export declare class ServiceProcessor extends BrokerBase {
    listService(): Promise<ServiceStructOutput[]>;
    acknowledgeProviderSigner(): Promise<void>;
    createTask(): Promise<void>;
    getTaskProgress(): Promise<string>;
}
//# sourceMappingURL=service.d.ts.map