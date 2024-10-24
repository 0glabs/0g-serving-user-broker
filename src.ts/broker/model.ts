import { ServiceStructOutput } from '../contract'
import { ZGServingUserBrokerBase } from './base'
import { MODEL_LIB } from './const'

export interface ZGServingModelInfo {
    Name: string
    Type: string
    Author?: string
    Description?: string
    HuggingFaceURL?: string
    ZGAlignmentScore?: string
}

export interface ZGService {
    Device?: string
    Geolocation?: string
    InputPrice: string
    ManualVerificationEndpoint: string
    Model: string
    Name: string
    OutputPrice: string
    ProviderAddress: string
    ServiceType: string
    UpdatedAt: string
    Uptime?: string
    URL: string
    Verifiability?: string
}

export interface ZGServingModel {
    ServingModelInfo: ZGServingModelInfo
    Price: string
    Providers: ZGService[]
}

/**
 * serviceProcessor 包含对 0G Serving Contract 上的 Service/Models 的 list 操作，
 */
export class ModelProcessor extends ZGServingUserBrokerBase {
    async listService() {
        try {
            const services = await this.contract.listService()
            return services
        } catch (error) {
            console.error('List Service Error:', error)
            throw error
        }
    }

    async listModels(): Promise<ZGServingModel> {
        let models: ZGServingModel
        try {
            const services = await this.listService()
            return
        } catch (error) {}
    }

    async getModel(model: string): Promise<ZGServingModel> {
        try {
        } catch (error) {}
    }

    groupByModel(items: ServiceStructOutput[]): ZGServingModel[] {
        const grouped = items.reduce((acc, item) => {
            const model = item.model
            if (!MODEL_LIB[model]) {
                return acc
            }
            if (!acc[model]) {
                acc[model] = {}
            }

            acc[model].push(item)
            return acc
        }, {} as Record<string, ServiceStructOutput[]>)

        // Convert the grouped object into a 2D array
        return Object.values(grouped)
    }
}
