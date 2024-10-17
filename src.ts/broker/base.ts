import { ServingContract } from '../contract'
import { Cache, CacheValueTypeEnum, Metadata } from '../storage'
import { ChatBot, Extractor } from '../extractor'
import { ServiceStructOutput } from '../contract/serving/Serving'

export abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract
    protected isConnected!: boolean

    constructor(contract: ServingContract) {
        this.contract = contract
    }

    protected async getProviderData(providerAddress: string) {
        const [nonce, outputFee, privateKey] = await Promise.all([
            Metadata.getNonce(providerAddress),
            Metadata.getOutputFee(providerAddress),
            Metadata.getPrivateKey(providerAddress),
        ])
        return { nonce, outputFee, privateKey }
    }

    protected async getService(
        providerAddress: string,
        svcName: string,
        useCache = true
    ): Promise<ServiceStructOutput> {
        const key = providerAddress + svcName
        const cachedSvc = Cache.getItem(key)
        if (cachedSvc && useCache) {
            return cachedSvc
        }

        try {
            const svc = await this.contract.getService(providerAddress, svcName)
            Cache.setItem(key, svc, 5 * 60 * 1000, CacheValueTypeEnum.Service)
            return svc
        } catch (error) {
            throw error
        }
    }

    protected async getExtractor(
        providerAddress: string,
        svcName: string,
        useCache = true
    ): Promise<Extractor> {
        try {
            const svc = await this.getService(
                providerAddress,
                svcName,
                useCache
            )
            return this.createExtractor(svc)
        } catch (error) {
            throw error
        }
    }

    protected createExtractor(svc: ServiceStructOutput): Extractor {
        switch (svc.serviceType) {
            case 'chatbot':
                return new ChatBot(svc)
            default:
                throw new Error('Unknown service type')
        }
    }
}
