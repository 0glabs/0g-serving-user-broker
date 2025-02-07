import { ZGServingUserBrokerBase } from './base'
import { Cache, CacheValueTypeEnum } from '../storage'
import { InferenceServingContract, ServiceStructOutput } from '../contract'
import { LedgerBroker } from '../../ledger'
import { Metadata } from '../../common/storage'

/**
 * ServingRequestHeaders contains headers related to request billing.
 * These need to be added to the request.
 */
export interface ServingRequestHeaders {
    'X-Phala-Signature-Type': 'StandaloneApi'
    /**
     * User's address
     */
    Address: string
    /**
     * Total fee for the request.
     * Equals 'Input-Fee' + 'Previous-Output-Fee'
     */
    Fee: string
    /**
     * Fee required for the input of this request.
     * For example, for a chatbot service,
     * 'Input-Fee' = number of tokens input by the user * price per token
     */
    'Input-Fee': string
    Nonce: string
    /**
     * Fee returned from the previous request.
     * In the 0G Serving system, the request is the only payment proof,
     * so the fee returned from the previous request will be included in the current request.
     * For example, for a chatbot service,
     * 'Previous-Output-Fee' = number of tokens returned by the service in the previous round * price per token
     */
    'Previous-Output-Fee': string
    /**
     * User's signature for the other headers.
     * By adding this information, the user gives the current request the characteristics of a settlement proof.
     */
    Signature: string
}

/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export class RequestProcessor extends ZGServingUserBrokerBase {
    private checkAccountThreshold = BigInt(1000)
    private topUpTriggerThreshold = BigInt(5000)
    private topUpTargetThreshold = BigInt(10000)
    private ledger: LedgerBroker

    constructor(
        contract: InferenceServingContract,
        metadata: Metadata,
        cache: Cache,
        ledger: LedgerBroker
    ) {
        super(contract, metadata, cache)
        this.ledger = ledger
    }

    async getServiceMetadata(providerAddress: string): Promise<{
        endpoint: string
        model: string
    }> {
        const service = await this.getService(providerAddress)
        return {
            endpoint: `${service.url}/v1/proxy`,
            model: service.model,
        }
    }

    /*
     * 1. To Ensure No Insufficient Balance Occurs.
     *
     * The provider settles accounts regularly. In addition, we will add a rule to the provider's settlement logic:
     * if the actual balance of the customer's account is less than 5000, settlement will be triggered immediately.
     * The actual balance is defined as the customer's inference account balance minus any unsettled amounts.
     *
     * This way, if the customer checks their account and sees a balance greater than 5000, even if the provider settles
     * immediately, the deduction will leave about 5000, ensuring that no insufficient balance situation occurs.
     *
     * 2. To Avoid Frequent Transfers
     *
     * On the customer's side, if the balance falls below 5000, it should be topped up to 10000. This is to avoid frequent
     * transfers.
     *
     * 3. To Avoid Having to Check the Balance on Every Customer Request
     *
     * Record expenditures in processResponse and maintain a total consumption amount. Every time the total expenditure
     * reaches 1000, recheck the balance and perform a transfer if necessary.
     *
     * ps: The units for 5000 and 1000 can be (service.inputPricePerToken + service.outputPricePerToken).
     */
    async getRequestHeaders(
        providerAddress: string,
        content: string
    ): Promise<ServingRequestHeaders> {
        try {
            await this.topUpAccountIfNeeded(providerAddress, content)
            return await this.getHeader(providerAddress, content, BigInt(0))
        } catch (error) {
            throw error
        }
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
                await this.handleFirstRound(provider, targetThreshold, gasPrice)
                return
            }

            // Calculate new fee and update cached fee
            const newFee = await this.calculateInputFees(extractor, content)
            await this.updateCachedFee(provider, newFee)

            // Check if we need to check the account
            if (!(await this.shouldCheckAccount(svc))) return

            // Re-check the account balance
            const acc = await this.contract.getAccount(provider)
            if (acc.balance < triggerThreshold) {
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
        targetThreshold: bigint,
        gasPrice?: number
    ) {
        try {
            const acc = await this.contract.getAccount(provider)

            // Check if the account balance is below the trigger threshold
            if (acc.balance < targetThreshold) {
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
}
