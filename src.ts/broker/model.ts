import { ServiceStructOutput } from '../contract'
import { ZGServingUserBrokerBase } from './base'
import { MODEL_LIB, MOCK_DATA, MOCK_AREA } from './const'

export enum VerifiabilityEnum {
    OpML = 'OpML',
    TeeML = 'TeeML',
    ZKML = 'ZKML',
}

export type Verifiability =
    | VerifiabilityEnum.OpML
    | VerifiabilityEnum.TeeML
    | VerifiabilityEnum.ZKML

export interface ZGService {
    Device?: string
    Geolocation?: string
    InputPrice: number
    AttestationDownLoadEndpoint: string
    Model: string
    Name: string
    OutputPrice: number
    ProviderAddress: string
    ServiceType: string
    UpdatedAt: string
    Uptime?: string
    URL: string
    Verifiability?: Verifiability
}

export interface ZGServingModel {
    Name: string
    Type: string
    Author?: string
    Description?: string
    HuggingFaceURL?: string
    ZGAlignmentScore?: string
    UserInteractedNumber?: number
    Price: string
    Verifiability: Verifiability
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

    /**
     * listModels 列出 models
     *
     * @returns models
     */
    async listModels(): Promise<ZGServingModel[]> {
        try {
            const services = await this.listService()
            return ModelProcessor.groupByModel(services)
        } catch (error) {
            throw error
        }
    }

    /**
     * getModel 得到 model 的详细信息，以及下属 provider 列表
     *
     * @param name - model 名称。
     * @returns headers。记录着请求的费用、用户签名等信息。
     */
    async getModel(name: string): Promise<ZGServingModel> {
        try {
            const model = (await this.listModels())?.find(
                (model) => model.Name === name
            )
            if (!model) {
                const error = new Error(`model ${name} not found`)
                console.error(error.message)
                throw error
            }
            return model
        } catch (error) {
            throw error
        }
    }

    static groupByModel(items: ServiceStructOutput[]): ZGServingModel[] {
        const sortedServices = [...items].sort((a, b) => {
            const nameA = a[1].toLowerCase()
            const nameB = b[1].toLowerCase()

            if (nameA < nameB) {
                return -1
            }
            if (nameA > nameB) {
                return 1
            }
            return 0
        })

        const grouped = sortedServices.reduce((acc, item) => {
            const model = item.model
            if (!MODEL_LIB[model]) {
                return acc
            }
            if (!acc[model]) {
                acc[model] = {
                    Name: MODEL_LIB[model].Name,
                    Type: MODEL_LIB[model].Type,
                    Author: MODEL_LIB[model].Author,
                    Description: MODEL_LIB[model].Description,
                    HuggingFaceURL: MODEL_LIB[model].HuggingFaceURL,
                    ZGAlignmentScore: MODEL_LIB[model].ZGAlignmentScore,
                    UserInteractedNumber: MODEL_LIB[model].UserInteractedNumber,
                    Price: '',
                    Verifiability: VerifiabilityEnum.OpML,
                    Providers: [],
                }
            }

            acc[model].Providers.push(ModelProcessor.parseService(item))
            return acc
        }, {} as Record<string, ZGServingModel>)

        const ret = Object.values(grouped)
        for (let i = 0; i < ret.length; i++) {
            const inputPrice = ret[i].Providers.map((p) => p.InputPrice)
            const outPrice = ret[i].Providers.map((p) => p.OutputPrice)
            const maxPrice = Math.max(...inputPrice, ...outPrice)
            const minPrice = Math.min(...inputPrice, ...outPrice)

            ret[i].Verifiability = ModelProcessor.getModelVerifiability(
                ret[i].Providers
            )

            ret[i].Price = `$${minPrice}~$${maxPrice}`
        }

        return ret.concat(MOCK_DATA)
    }

    static parseService(service: ServiceStructOutput): ZGService {
        const priorityRandom = [
            VerifiabilityEnum.OpML,
            VerifiabilityEnum.TeeML,
            VerifiabilityEnum.ZKML,
        ]

        return {
            AttestationDownLoadEndpoint: `${service.url}/v1/proxy/${service.name}/attestation/report`,
            Model: service.model,
            Name: service.name,
            InputPrice: Number(service.inputPrice),
            OutputPrice: Number(service.outputPrice),
            ProviderAddress: service.provider,
            ServiceType: service.serviceType,
            UpdatedAt: service.updatedAt.toString(),
            URL: service.url,
            // TODO: remove Mock data
            Device: 'H100',
            Geolocation: MOCK_AREA[Math.floor(Math.random() * 5)],
            Uptime: `${(100 - Math.floor(Math.random() * 5)).toString()}%`,
            Verifiability:
                priorityRandom[
                    Number(service.inputPrice) >= 3
                        ? 2
                        : Number(service.inputPrice) >= 2
                        ? 1
                        : 0
                ],
        }
    }

    static getModelVerifiability(services: ZGService[]): Verifiability {
        const priority = [
            VerifiabilityEnum.ZKML,
            VerifiabilityEnum.TeeML,
            VerifiabilityEnum.OpML,
        ]

        for (const p of priority) {
            if (services.find((item) => item.Verifiability === p)) {
                return p
            }
        }

        return VerifiabilityEnum.OpML
    }
}
