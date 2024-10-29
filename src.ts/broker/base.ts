import { ServingContract } from '../contract'
import { Cache, CacheValueTypeEnum, Metadata } from '../storage'
import { ChatBot, Extractor } from '../extractor'
import { ServiceStructOutput } from '../contract/serving/Serving'

export interface ZGServingUserBrokerConfig {
    /**
     * WebAssembly 二进制文件路径。
     *
     * 该文件用于验证 signing address 的 Remote attestation 报告。
     *
     * 0G Serving Broker SDK 的使用者需要将该二进制文件放到服务器的
     * 静态资源目录，并在此填写路径。
     */
    dcapWasmPath: string
}

export abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract
    protected config: ZGServingUserBrokerConfig

    constructor(contract: ServingContract, config: ZGServingUserBrokerConfig) {
        this.contract = contract
        this.config = config
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
