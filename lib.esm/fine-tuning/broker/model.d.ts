import { BrokerBase } from './base';
export declare class ModelProcessor extends BrokerBase {
    uploadDataset(privateKey: string, dataPath: string, isTurbo: boolean): Promise<string>;
    acknowledgeModel(providerAddress: string, serviceName: string, dataPath: string, customerAddress: string): Promise<void>;
    decryptModel(): Promise<void>;
}
//# sourceMappingURL=model.d.ts.map