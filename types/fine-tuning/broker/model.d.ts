import { UploadArgs } from '../zg-storage/zg-storage';
import { BrokerBase } from './base';
export declare class ModelProcessor extends BrokerBase {
    uploadDataset(args: UploadArgs): Promise<string>;
    acknowledgeModel(providerAddress: string, serviceName: string, dataPath: string, customerAddress: string): Promise<void>;
    decryptModel(): Promise<void>;
}
//# sourceMappingURL=model.d.ts.map