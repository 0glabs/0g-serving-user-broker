import {
    aesGCMDecryptToFile,
    eciesDecrypt,
    hexToRoots,
} from '../../common/utils'
import { MODEL_HASH_MAP, TOKEN_COUNTER_MERKLE_ROOT } from '../const'
import { download, upload } from '../zg-storage'
import { BrokerBase } from './base'
import { calculateTokenSizeViaPython, calculateTokenSizeViaExe } from '../token'
import { promises as fs } from 'fs'
import AdmZip from 'adm-zip'

export class ModelProcessor extends BrokerBase {
    listModel(): [string, { [key: string]: string }][] {
        return Object.entries(MODEL_HASH_MAP)
    }

    async uploadDataset(
        privateKey: string,
        dataPath: string,
        gasPrice?: number,
        maxGasPrice?: number
    ): Promise<void> {
        try {
            const stats = await fs.stat(dataPath)
            let zipFile = dataPath
            if (stats.isDirectory()) {
                zipFile = `${dataPath}.zip`

                const zip = new AdmZip()
                zip.addLocalFolder(dataPath)
                zip.writeZip(zipFile)
            } else if (!stats.isFile()) {
                throw new Error('data-path is neither a file nor a directory')
            }

            await upload(privateKey, zipFile, gasPrice)
        } catch (error) {
            console.error('Error during processing:', error)
            throw error
        }
    }

    async calculateToken(
        datasetPath: string,
        usePython: boolean,
        preTrainedModelName: string
    ) {
        let dataSize = 0
        if (usePython) {
            dataSize = await calculateTokenSizeViaPython(
                MODEL_HASH_MAP[preTrainedModelName].tokenizer,
                datasetPath,
                MODEL_HASH_MAP[preTrainedModelName].type
            )
        } else {
            dataSize = await calculateTokenSizeViaExe(
                MODEL_HASH_MAP[preTrainedModelName].tokenizer,
                datasetPath,
                MODEL_HASH_MAP[preTrainedModelName].type,
                TOKEN_COUNTER_MERKLE_ROOT
            )
        }

        console.log(
            `The token size for the dataset ${datasetPath} is ${dataSize}`
        )
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
