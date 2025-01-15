import { UploadArgs } from '../zg-storage/zg-storage'
import { BrokerBase } from './base'
import { INDEXER_URL_STANDARD, INDEXER_URL_TURBO } from '../const'

export class ModelProcessor extends BrokerBase {
    // 6. [`use 0g storage sdk`] upload dataset, get dataset root hash
    async uploadDataset(args: UploadArgs): Promise<string> {
        return this.zgClient.upload(args)
    }

    // 9. acknowledge encrypted model with root hash
    //     1. [`call contract`] get deliverable with root hash
    //     2. [`use 0g storage sdk`] download model, calculate root hash, compare with provided root hash
    //     3. [`call contract`] acknowledge the model in contract
    async acknowledgeModel(providerAddress: string, serviceName: string, dataPath: string, customerAddress: string): Promise<void> {
        const account = await this.contract.getAccount(providerAddress)
        const latestDeliverable = account.deliverables[-1]

        const task = await this.servingProvider.getLatestTask(providerAddress, serviceName, customerAddress)

        await this.zgClient.download({
            dataPath: dataPath,
            indexerUrl: task.isTurbo ? INDEXER_URL_TURBO : INDEXER_URL_STANDARD,
            dataRoot: latestDeliverable.modelRootHash
        })

        await this.contract.acknowledgeDeliverable(providerAddress, account.deliverables.length - 1)
    }

    // 10. decrypt model
    //     1. [`call contract`] get deliverable with encryptedSecret
    //     2. decrypt the encryptedSecret
    //     3. decrypt model with secret [TODO: Discuss LiuYuan]
    async decryptModel(): Promise<void> {
        return
    }
}
