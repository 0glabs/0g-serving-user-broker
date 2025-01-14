import { ServiceStructOutput } from '../../contract/fine-tuning'
import { BrokerBase } from './base'

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
    async createTask(): Promise<void> {
        return
    }

    // 8. [`call provider url/v1/task-progress`] call provider task progress api to get task progress
    async getTaskProgress(): Promise<string> {
        return ''
    }
}
