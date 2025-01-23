import { aesGCMDecrypt, eciesDecrypt } from '../../common/utils'
import { MODEL_HASH_MAP } from '../const'
import { download, upload } from '../zg-storage'
import { BrokerBase } from './base'
import { promises as fs } from 'fs'

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

            const latestDeliverable =
                account.deliverables[account.deliverables.length - 1]

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

    async decryptModel(
        providerAddress: string,
        encryptedModelPath: string,
        decryptedModelPath: string
    ): Promise<void> {
        try {
            const account = await this.contract.getAccount(providerAddress)

            const latestDeliverable =
                account.deliverables[account.deliverables.length - 1]

            if (!latestDeliverable) {
                throw new Error('No deliverable found')
            }

            const secret = await eciesDecrypt(
                this.contract.signer,
                latestDeliverable.encryptedSecret
            )

            const encryptedData = await fs.readFile(encryptedModelPath)

            const model = await aesGCMDecrypt(
                secret,
                encryptedData,
                account.providerSigner
            )
            await fs.writeFile(decryptedModelPath, model)
        } catch (error) {
            throw error
        }
        return
    }
}
