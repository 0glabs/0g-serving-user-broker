import { MODEL_HASH_MAP } from '../const'
import { ServiceStructOutput } from '../contract'
import { BrokerBase } from './base'
import * as fs from 'fs/promises'

export interface CreateTaskArgs {
    pretrainedModelName: string,
    datasetRootHash: string,
    isTurbo: boolean,
    providerAddress: string,
    dataSize: number,
}

export class ServiceProcessor extends BrokerBase {
    // 4. list services
    async listService(): Promise<ServiceStructOutput[]> {
        try {
            const services = await this.contract.listService()
            return services
        } catch (error) {
            throw error
        }
    }

    // 5. acknowledge provider signer
    //     1. [`call provider url/v1/quote`] call provider quote api to download quote (contains provider signer)
    //     2. [`TBD`] verify the quote using third party service (TODO: Jiahao discuss with Phala)
    //     3. [`call contract`] acknowledge the provider signer in contract
    async acknowledgeProviderSigner(): Promise<void> {
        return
    }

    // 7. create task
    //     1. get preTrained model root hash based on the model
    //     2. [`call contract`] calculate fee
    //     3. [`call contract`] transfer fund from ledger to fine-tuning provider
    //     4. [`call provider url/v1/task`]call provider task creation api to create task
    async createTask(pretrainedModelName: string, dataSize: number, rootHash: string, isTurbo: boolean, providerAddress: string, serviceName: string, trainingPath: string): Promise<void> {
        const service = await this.contract.getService(providerAddress, serviceName)
        const fee = service.pricePerToken * BigInt(dataSize)

        await this.ledger.transferFund(providerAddress, "fine-tuning", fee)

        // Read the JSON file
        const trainingPathContent = await fs.readFile(trainingPath, "utf-8");

        // Parse it to ensure it's valid JSON, then stringify it again if needed
        try {
            JSON.parse(trainingPathContent); // Validate JSON
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(`Invalid JSON in trainingPath file: ${err.message}`);
            } else {
                throw new Error("Invalid JSON in trainingPath file: An unknown error occurred");
            }
        }

        // Get model hash
        const modelHash = MODEL_HASH_MAP[pretrainedModelName][isTurbo ? "turbo" : "standard"]
        await this.servingProvider.createTask(modelHash, rootHash, isTurbo, providerAddress, serviceName, fee.toString(), trainingPathContent)
    }

    // 8. [`call provider url/v1/task-progress`] call provider task progress api to get task progress
    async getTaskProgress(providerAddress: string, serviceName: string, customerAddress: string): Promise<string> {
        return await this.servingProvider.getTaskProgress(providerAddress, serviceName, customerAddress)
    }
}
