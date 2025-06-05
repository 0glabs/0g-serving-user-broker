import {
    aesGCMDecryptToFile,
    eciesDecrypt,
    hexToRoots,
} from '../../common/utils'
import {
    MODEL_HASH_MAP,
    TOKEN_COUNTER_FILE_HASH,
    TOKEN_COUNTER_MERKLE_ROOT,
} from '../const'
import { download, upload } from '../zg-storage'
import { BrokerBase } from './base'
import { calculateTokenSizeViaPython, calculateTokenSizeViaExe } from '../token'

export class ModelProcessor extends BrokerBase {
    async listModel(): Promise<[string, { [key: string]: string }][][]> {
        const services = await this.contract.listService()
        let customizedModels: [string, { [key: string]: string }][] = []
        for (const service of services) {
            if (service.models.length !== 0) {
                const url = service.url
                const models = await this.servingProvider.getCustomizedModels(
                    url
                )
                for (const item of models) {
                    customizedModels.push([
                        item.name,
                        {
                            description: item.description,
                            provider: service.provider,
                        },
                    ])
                }
            }
        }

        return [Object.entries(MODEL_HASH_MAP), customizedModels]
    }

    async uploadDataset(
        privateKey: string,
        dataPath: string,
        gasPrice?: number,
        maxGasPrice?: number
    ): Promise<void> {
        await upload(privateKey, dataPath, gasPrice)
    }

    async calculateToken(
        datasetPath: string,
        usePython: boolean,
        preTrainedModelName: string,
        providerAddress?: string
    ) {
        let tokenizer: string
        let dataType: string
        if (preTrainedModelName in MODEL_HASH_MAP) {
            tokenizer = MODEL_HASH_MAP[preTrainedModelName].tokenizer
            dataType = MODEL_HASH_MAP[preTrainedModelName].type
        } else {
            if (providerAddress === undefined) {
                throw new Error(
                    'Provider address is required for customized model'
                )
            }

            let model = await this.servingProvider.getCustomizedModel(
                providerAddress,
                preTrainedModelName
            )
            tokenizer = model.tokenizer
            dataType = model.dataType
        }

        let dataSize = 0
        if (usePython) {
            dataSize = await calculateTokenSizeViaPython(
                tokenizer,
                datasetPath,
                dataType
            )
        } else {
            dataSize = await calculateTokenSizeViaExe(
                tokenizer,
                datasetPath,
                dataType,
                TOKEN_COUNTER_MERKLE_ROOT,
                TOKEN_COUNTER_FILE_HASH
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
