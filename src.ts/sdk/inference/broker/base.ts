import { InferenceServingContract } from '../contract'
import { ChatBot, Extractor } from '../extractor'
import { ServiceStructOutput } from '../contract'
import { ServingRequestHeaders } from './request'
import {
    decryptData,
    getNonceWithCache,
    strToPrivateKey,
} from '../../common/utils'
import { PackedPrivkey, Request, signData } from '../../common/settle-signer'
import { Cache, CacheValueTypeEnum, Metadata } from '../../common/storage'
import { LedgerBroker } from '../../ledger'

export abstract class ZGServingUserBrokerBase {
    protected contract: InferenceServingContract
    protected metadata: Metadata
    protected cache: Cache

    private checkAccountThreshold = BigInt(1000)
    private topUpTriggerThreshold = BigInt(5000)
    private topUpTargetThreshold = BigInt(10000)
    private ledger: LedgerBroker

    constructor(
        contract: InferenceServingContract,
        ledger: LedgerBroker,
        metadata: Metadata,
        cache: Cache
    ) {
        this.contract = contract
        this.ledger = ledger
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
        useCache = true
    ): Promise<ServiceStructOutput> {
        const key = providerAddress
        const cachedSvc = await this.cache.getItem(key)
        if (cachedSvc && useCache) {
            return cachedSvc
        }

        try {
            const svc = await this.contract.getService(providerAddress)
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
        useCache = true
    ): Promise<Extractor> {
        try {
            const svc = await this.getService(providerAddress, useCache)
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
        content: string,
        outputFee: bigint
    ): Promise<ServingRequestHeaders> {
        try {
            const extractor = await this.getExtractor(providerAddress)
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

            const nonce = await getNonceWithCache(this.cache)

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
                Signature: sig,
            }
        } catch (error) {
            throw error
        }
    }

    async calculateInputFees(extractor: Extractor, content: string) {
        const svc = await extractor.getSvcInfo()
        const inputCount = await extractor.getInputCount(content)
        const inputFee = BigInt(inputCount) * svc.inputPrice
        return inputFee
    }

    async updateCachedFee(provider: string, fee: bigint) {
        try {
            const curFee =
                (await this.cache.getItem(provider + '_cachedFee')) || BigInt(0)
            await this.cache.setItem(
                provider + '_cachedFee',
                BigInt(curFee) + fee,
                1 * 60 * 1000,
                CacheValueTypeEnum.BigInt
            )
        } catch (error) {
            throw error
        }
    }

    async clearCacheFee(provider: string, fee: bigint) {
        try {
            const curFee =
                (await this.cache.getItem(provider + '_cachedFee')) || BigInt(0)
            await this.cache.setItem(
                provider,
                BigInt(curFee) + fee,
                1 * 60 * 1000,
                CacheValueTypeEnum.BigInt
            )
        } catch (error) {
            throw error
        }
    }

    /**
     * Transfer fund from ledger if fund in the inference account is less than a 5000 * (inputPrice + outputPrice)
     */
    async topUpAccountIfNeeded(
        provider: string,
        content: string,
        gasPrice?: number
    ) {
        try {
            const extractor = await this.getExtractor(provider)
            const svc = await extractor.getSvcInfo()

            // Calculate target and trigger thresholds
            const targetThreshold =
                this.topUpTargetThreshold * (svc.inputPrice + svc.outputPrice)
            const triggerThreshold =
                this.topUpTriggerThreshold * (svc.inputPrice + svc.outputPrice)

            // Check if it's the first round
            const isFirstRound =
                (await this.cache.getItem('firstRound')) !== 'false'

            if (isFirstRound) {
                await this.handleFirstRound(
                    provider,
                    triggerThreshold,
                    targetThreshold,
                    gasPrice
                )
                return
            }

            // Calculate new fee and update cached fee
            const newFee = await this.calculateInputFees(extractor, content)
            await this.updateCachedFee(provider, newFee)

            // Check if we need to check the account
            if (!(await this.shouldCheckAccount(svc))) return

            // Re-check the account balance
            const acc = await this.contract.getAccount(provider)
            const lockedFund = acc.balance - acc.pendingRefund
            if (lockedFund < triggerThreshold) {
                await this.ledger.transferFund(
                    provider,
                    'inference',
                    targetThreshold,
                    gasPrice
                )
            }

            await this.clearCacheFee(provider, newFee)
        } catch (error) {
            throw error
        }
    }

    private async handleFirstRound(
        provider: string,
        triggerThreshold: bigint,
        targetThreshold: bigint,
        gasPrice?: number
    ) {
        try {
            const acc = await this.contract.getAccount(provider)

            // Check if the account balance is below the trigger threshold
            const lockedFund = acc.balance - acc.pendingRefund
            if (lockedFund < triggerThreshold) {
                await this.ledger.transferFund(
                    provider,
                    'inference',
                    targetThreshold,
                    gasPrice
                )
            }
        } catch (error) {
            if ((error as any).message.includes('AccountNotExists')) {
                await this.ledger.transferFund(
                    provider,
                    'inference',
                    targetThreshold,
                    gasPrice
                )
            } else {
                throw error
            }
        }

        // Mark the first round as complete
        await this.cache.setItem(
            'firstRound',
            'false',
            10000000 * 60 * 1000,
            CacheValueTypeEnum.Other
        )
    }

    /**
     * Check the cache fund for this provider, return true if the fund is above 1000 * (inputPrice + outputPrice)
     * @param provider
     * @param svc
     */
    async shouldCheckAccount(svc: ServiceStructOutput) {
        try {
            const key = svc.provider + '_cachedFee'
            const usedFund = (await this.cache.getItem(key)) || BigInt(0)
            return (
                usedFund >
                this.checkAccountThreshold * (svc.inputPrice + svc.outputPrice)
            )
        } catch (error) {
            throw error
        }
    }
}
