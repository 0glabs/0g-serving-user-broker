import { BrokerBase } from './base';
export declare class ModelProcessor extends BrokerBase {
    listModel(): [string, {
        [key: string]: string;
    }][];
    uploadDataset(privateKey: string, dataPath: string, gasPrice?: number): Promise<void>;
    calculateToken(datasetPath: string, usePython: boolean, preTrainedModelName: string): Promise<void>;
    downloadDataset(dataPath: string, dataRoot: string): Promise<void>;
    acknowledgeModel(providerAddress: string, dataPath: string, gasPrice?: number): Promise<void>;
    decryptModel(providerAddress: string, encryptedModelPath: string, decryptedModelPath: string): Promise<void>;
}
//# sourceMappingURL=model.d.ts.map