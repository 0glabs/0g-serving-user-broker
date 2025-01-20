import { FineTuningServingContract } from '../contract'

export interface Task {
    readonly id?: string
    readonly createdAt?: string
    readonly updatedAt?: string
    userAddress: string
    serviceName: string
    preTrainedModelHash: string
    datasetHash: string
    trainingParams: string
    fee: string
    nonce: string
    signature: string
    readonly progress?: string
    readonly deliverIndex?: string
}
export class Provider {
    private contract: FineTuningServingContract

    constructor(contract: FineTuningServingContract) {
        this.contract = contract
    }

    private async fetchJSON(
        endpoint: string,
        options: RequestInit
    ): Promise<any> {
        try {
            const response = await fetch(endpoint, options)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            return response.json()
        } catch (error) {
            throw error
        }
    }

    private async fetchText(
        endpoint: string,
        options: RequestInit
    ): Promise<string> {
        try {
            const response = await fetch(endpoint, options)
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`)
            }
            const buffer = await response.arrayBuffer()
            return Buffer.from(buffer).toString('utf-8')
        } catch (error) {
            throw error
        }
    }

    async getProviderUrl(
        providerAddress: string,
        serviceName: string
    ): Promise<string> {
        try {
            const service = await this.contract.getService(
                providerAddress,
                serviceName
            )
            return service.url
        } catch (error) {
            throw error
        }
    }

    async createTask(providerAddress: string, task: Task): Promise<string> {
        try {
            const url = await this.getProviderUrl(
                providerAddress,
                task.serviceName
            )
            const endpoint = `${url}/v1/task`

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            })

            if (!response.ok) {
                throw new Error(`Failed to create task: ${response.statusText}`)
            }

            const responseData = await response.json()
            return responseData.id
        } catch (error) {
            throw error
        }
    }

    async listTask(
        providerAddress: string,
        serviceName: string,
        userAddress: string,
        latest = false
    ): Promise<Task[]> {
        try {
            const url = await this.getProviderUrl(providerAddress, serviceName)
            let endpoint = `${url}/v1/user/${encodeURIComponent(
                userAddress
            )}/task`

            if (latest) {
                endpoint += '?latest=true'
            }

            return this.fetchJSON(endpoint, { method: 'GET' }) as Promise<
                Task[]
            >
        } catch (error) {
            throw error
        }
    }

    async getLog(
        providerAddress: string,
        serviceName: string,
        userAddress: string,
        taskID: string
    ): Promise<string> {
        try {
            const url = await this.getProviderUrl(providerAddress, serviceName)
            const endpoint = `${url}/v1/user/${userAddress}/task/${taskID}/log`

            return this.fetchText(endpoint, { method: 'GET' })
        } catch (error) {
            throw error
        }
    }
}
