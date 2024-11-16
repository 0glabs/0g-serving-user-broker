import { ServingContract } from '../contract'
import { Cache, CacheValueTypeEnum, Metadata } from '../storage'
import { ChatBot, Extractor } from '../extractor'
import { ServiceStructOutput } from '../contract/serving/Serving'

export abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract

    constructor(contract: ServingContract) {
        this.contract = contract
    }

    protected async getProviderData(providerAddress: string) {
        const key = this.contract.getUserAddress() + providerAddress
        const [nonce, outputFee, zkPrivateKey] = await Promise.all([
            Metadata.getNonce(key),
            Metadata.getOutputFee(key),
            Metadata.getZKPrivateKey(key),
        ])
        return { nonce, outputFee, zkPrivateKey }
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
            Cache.setItem(key, svc, 1 * 60 * 1000, CacheValueTypeEnum.Service)
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
            const extractor = this.createExtractor(svc)
            return extractor
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
