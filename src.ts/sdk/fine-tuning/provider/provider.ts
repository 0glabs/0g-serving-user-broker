import { FineTuningServingContract } from '../contract'

export interface Task {
    readonly id?: string
    readonly createdAt?: string
    readonly updatedAt?: string
    userAddress: string
    preTrainedModelHash: string
    datasetHash: string
    trainingParams: string
    fee: string
    nonce: string
    signature: string
    readonly progress?: string
    readonly deliverIndex?: string
    imageName?: string
    dockerRunCmd?: string
}

export interface QuoteResponse {
    quote: string
    provider_signer: string
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
                const errorData = await response.json()
                throw new Error(errorData.error)
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

    async getProviderUrl(providerAddress: string): Promise<string> {
        try {
            const service = await this.contract.getService(providerAddress)
            return service.url
        } catch (error) {
            throw error
        }
    }

    async getQuote(providerAddress: string): Promise<QuoteResponse> {
        try {
            const url = await this.getProviderUrl(providerAddress)
            const endpoint = `${url}/v1/quote`

            const quoteString = await this.fetchText(endpoint, {
                method: 'GET',
            })
            const ret = JSON.parse(quoteString)
            return ret
        } catch (error) {
            throw error
        }
    }

    async createTask(providerAddress: string, task: Task): Promise<string> {
        try {
            const url = await this.getProviderUrl(providerAddress)
            const userAddress = this.contract.getUserAddress()
            const endpoint = `${url}/v1/user/${userAddress}/task`

            const response = await this.fetchJSON(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            })
            return response.id
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create task: ${error.message}`)
            }
            throw new Error('Failed to create task')
        }
    }

    async getTask(
        providerAddress: string,
        userAddress: string,
        taskID: string
    ): Promise<Task> {
        try {
            const url = await this.getProviderUrl(providerAddress)
            const endpoint = `${url}/v1/user/${encodeURIComponent(
                userAddress
            )}/task/${taskID}`

            console.log('url', url)
            console.log('endpoint', endpoint)

            return this.fetchJSON(endpoint, { method: 'GET' }) as Promise<Task>
        } catch (error) {
            throw error
        }
    }

    async listTask(
        providerAddress: string,
        userAddress: string,
        latest = false
    ): Promise<Task[]> {
        try {
            const url = await this.getProviderUrl(providerAddress)
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
        userAddress: string,
        taskID: string
    ): Promise<string> {
        try {
            const url = await this.getProviderUrl(providerAddress)
            const endpoint = `${url}/v1/user/${userAddress}/task/${taskID}/log`
            return this.fetchText(endpoint, { method: 'GET' })
        } catch (error) {
            throw error
        }
    }
}
