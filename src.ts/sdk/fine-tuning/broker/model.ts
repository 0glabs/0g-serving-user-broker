import { MODEL_HASH_MAP } from '../const'
import { download, upload } from '../zg-storage'
import { BrokerBase } from './base'

export class ModelProcessor extends BrokerBase {
    listModel(): string[] {
        return Object.keys(MODEL_HASH_MAP)
    }

    async uploadDataset(privateKey: string, dataPath: string): Promise<void> {
        upload(privateKey, dataPath)
    }

    async downloadDataset(dataPath: string, dataRoot: string): Promise<void> {
        download(dataPath, dataRoot)
    }

    async acknowledgeModel(
        providerAddress: string,
        dataPath: string
    ): Promise<void> {
        try {
            const account = await this.contract.getAccount(providerAddress)
            const latestDeliverable = account.deliverables[-1]

            if (!latestDeliverable) {
                throw new Error('No deliverable found')
            }

            await download(dataPath, latestDeliverable.modelRootHash)

            await this.contract.acknowledgeDeliverable(
                providerAddress,
                account.deliverables.length - 1
            )
        } catch (error) {
            throw error
        }
    }

    // 10. decrypt model
    //     1. [`call contract`] get deliverable with encryptedSecret
    //     2. decrypt the encryptedSecret
    //     3. decrypt model with secret [TODO: Discuss LiuYuan]
    async decryptModel(): Promise<void> {
        return
    }
}
