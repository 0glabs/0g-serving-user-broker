import { BrokerBase } from './base';
export declare class ModelProcessor extends BrokerBase {
    uploadDataset(privateKey: string, dataPath: string): Promise<string>;
    acknowledgeModel(providerAddress: string, dataPath: string): Promise<void>;
    decryptModel(): Promise<void>;
}
//# sourceMappingURL=model.d.ts.map