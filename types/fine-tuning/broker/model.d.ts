import { BrokerBase } from './base';
export declare class ModelProcessor extends BrokerBase {
    listModel(): string[];
    uploadDataset(privateKey: string, dataPath: string): Promise<void>;
    acknowledgeModel(providerAddress: string, dataPath: string): Promise<void>;
    decryptModel(): Promise<void>;
}
//# sourceMappingURL=model.d.ts.map