import {
    aesGCMDecryptToFile,
    eciesDecrypt,
    hexToRoots,
} from '../../common/utils'
import { MODEL_HASH_MAP } from '../const'
import { download, upload } from '../zg-storage'
import { BrokerBase } from './base'
import { calculateTokenSize } from '../token'

export class ModelProcessor extends BrokerBase {
    listModel(): [string, { [key: string]: string }][] {
        return Object.entries(MODEL_HASH_MAP)
    }

    async uploadDataset(
        privateKey: string,
        dataPath: string,
        gasPrice?: number,
        preTrainedModelName?: string
    ): Promise<void> {
        if (
            preTrainedModelName !== undefined &&
            MODEL_HASH_MAP[preTrainedModelName].tokenizer !== undefined &&
            MODEL_HASH_MAP[preTrainedModelName].tokenizer !== ''
        ) {
            let dataSize = await calculateTokenSize(
                MODEL_HASH_MAP[preTrainedModelName].tokenizer,
                dataPath,
                MODEL_HASH_MAP[preTrainedModelName].type
            )
            console.log(
                `The token size for the dataset ${dataPath} is ${dataSize}`
            )
        }

        await upload(privateKey, dataPath, gasPrice)
    }

    async downloadDataset(dataPath: string, dataRoot: string): Promise<void> {
        download(dataPath, dataRoot)
    }

    async acknowledgeModel(
        providerAddress: string,
        dataPath: string,
        gasPrice?: number
    ): Promise<void> {
        try {
            const account = await this.contract.getAccount(providerAddress)

            const latestDeliverable =
                account.deliverables[account.deliverables.length - 1]

            if (!latestDeliverable) {
                throw new Error('No deliverable found')
            }

            await download(
                dataPath,
                hexToRoots(latestDeliverable.modelRootHash)
            )

            await this.contract.acknowledgeDeliverable(
                providerAddress,
                account.deliverables.length - 1,
                gasPrice
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

            if (!latestDeliverable.acknowledged) {
                throw new Error('Deliverable not acknowledged yet')
            }

            if (!latestDeliverable.encryptedSecret) {
                throw new Error('EncryptedSecret not found')
            }

            const secret = await eciesDecrypt(
                this.contract.signer,
                latestDeliverable.encryptedSecret
            )

            await aesGCMDecryptToFile(
                secret,
                encryptedModelPath,
                decryptedModelPath,
                account.providerSigner
            )
        } catch (error) {
            throw error
        }
        return
    }
}
