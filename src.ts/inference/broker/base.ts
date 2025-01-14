import { InferenceServingContract } from '../../contract/inference'
import { Cache, CacheValueTypeEnum, Metadata } from '../../common/storage'
import { ChatBot, Extractor } from '../extractor'
import { ServiceStructOutput } from '../../contract/inference'
import { ServingRequestHeaders } from './request'
import { decryptData, getNonce, strToPrivateKey } from '../../common/utils'
import { PackedPrivkey, Request, signData } from '../../common/settle-signer'

export abstract class ZGServingUserBrokerBase {
    protected contract: InferenceServingContract
    protected metadata: Metadata
    protected cache: Cache

    constructor(
        contract: InferenceServingContract,
        metadata: Metadata,
        cache: Cache
    ) {
        this.contract = contract
        this.metadata = metadata
        this.cache = cache
    }

    protected async getProviderData(providerAddress: string) {
        const key = `${this.contract.getUserAddress()}_${providerAddress}`
        const [settleSignerPrivateKey] = await Promise.all([
            this.metadata.getSettleSignerPrivateKey(key),
        ])
        return { settleSignerPrivateKey }
    }

    protected async getService(
        providerAddress: string,
        svcName: string,
        useCache = true
    ): Promise<ServiceStructOutput> {
        const key = providerAddress + svcName
        const cachedSvc = await this.cache.getItem(key)
        if (cachedSvc && useCache) {
            return cachedSvc
        }

        try {
            const svc = await this.contract.getService(providerAddress, svcName)
            await this.cache.setItem(
                key,
                svc,
                1 * 60 * 1000,
                CacheValueTypeEnum.Service
            )
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

    protected a0giToNeuron(value: number): bigint {
        const valueStr = value.toFixed(18)
        const parts = valueStr.split('.')

        // Handle integer part
        const integerPart = parts[0]
        let integerPartAsBigInt = BigInt(integerPart) * BigInt(10 ** 18)

        // Handle fractional part if it exists
        if (parts.length > 1) {
            let fractionalPart = parts[1]
            while (fractionalPart.length < 18) {
                fractionalPart += '0'
            }
            if (fractionalPart.length > 18) {
                fractionalPart = fractionalPart.slice(0, 18) // Truncate to avoid overflow
            }

            const fractionalPartAsBigInt = BigInt(fractionalPart)
            integerPartAsBigInt += fractionalPartAsBigInt
        }

        return integerPartAsBigInt
    }

    protected neuronToA0gi(value: bigint): number {
        const divisor = BigInt(10 ** 18)
        const integerPart = value / divisor
        const remainder = value % divisor
        const decimalPart = Number(remainder) / Number(divisor)

        return Number(integerPart) + decimalPart
    }

    async getHeader(
        providerAddress: string,
        svcName: string,
        content: string,
        outputFee: bigint
    ): Promise<ServingRequestHeaders> {
        try {
            const extractor = await this.getExtractor(providerAddress, svcName)
            const { settleSignerPrivateKey } = await this.getProviderData(
                providerAddress
            )
            const key = `${this.contract.getUserAddress()}_${providerAddress}`

            let privateKey = settleSignerPrivateKey
            if (!privateKey) {
                const account = await this.contract.getAccount(providerAddress)
                const privateKeyStr = await decryptData(
                    this.contract.signer,
                    account.additionalInfo
                )
                privateKey = strToPrivateKey(privateKeyStr)
                this.metadata.storeSettleSignerPrivateKey(key, privateKey)
            }

            const nonce = getNonce()

            const inputFee = await this.calculateInputFees(extractor, content)
            const fee = inputFee + outputFee

            const request = new Request(
                nonce.toString(),
                fee.toString(),
                this.contract.getUserAddress(),
                providerAddress
            )
            const settleSignature = await signData(
                [request],
                privateKey as PackedPrivkey
            )
            const sig = JSON.stringify(Array.from(settleSignature[0]))

            return {
                'X-Phala-Signature-Type': 'StandaloneApi',
                Address: this.contract.getUserAddress(),
                Fee: fee.toString(),
                'Input-Fee': inputFee.toString(),
                Nonce: nonce.toString(),
                'Previous-Output-Fee': outputFee.toString(),
                'Service-Name': svcName,
                Signature: sig,
            }
        } catch (error) {
            throw error
        }
    }

    private async calculateInputFees(extractor: Extractor, content: string) {
        const svc = await extractor.getSvcInfo()
        const inputCount = await extractor.getInputCount(content)
        const inputFee = BigInt(inputCount) * svc.inputPrice
        return inputFee
    }
}
