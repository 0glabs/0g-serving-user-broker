import { InferenceServingContract } from '../contract'
import { Extractor } from '../extractor'
import { Metadata, Cache } from '../../common/storage'
import { ZGServingUserBrokerBase } from './base'
import { isVerifiability } from './model'
import { Verifier } from './verifier'
import { LedgerBroker } from '../../ledger'

/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export class ResponseProcessor extends ZGServingUserBrokerBase {
    private verifier: Verifier

    constructor(
        contract: InferenceServingContract,
        ledger: LedgerBroker,
        metadata: Metadata,
        cache: Cache
    ) {
        super(contract, ledger, metadata, cache)
        this.verifier = new Verifier(contract, ledger, metadata, cache)
    }

    async settleFeeWithA0gi(
        providerAddress: string,
        fee: number
    ): Promise<void> {
        if (!fee) {
            return
        }
        await this.topUpAccountIfNeeded(providerAddress, '')
        await this.settleFee(providerAddress, this.a0giToNeuron(fee))
    }

    /**
     * settleFee sends an empty request to the service provider to settle the fee.
     */
    async settleFee(providerAddress: string, fee: bigint): Promise<void> {
        try {
            if (!fee) {
                return
            }
            const service = await this.contract.getService(providerAddress)
            if (!service) {
                throw new Error('Service is not available')
            }

            const { provider, url } = service
            const headers = await this.getHeader(provider, '', fee)

            const response = await fetch(`${url}/v1/proxy/settle-fee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            })

            if (response.status !== 202 && response.status !== 200) {
                const errorData = await response.json()
                throw new Error(errorData.error)
            }
        } catch (error) {
            throw error
        }
    }

    async processResponse(
        providerAddress: string,
        content: string,
        chatID?: string
    ): Promise<boolean | null> {
        try {
            const extractor = await this.getExtractor(providerAddress)
            const outputFee = await this.calculateOutputFees(extractor, content)
            await this.updateCachedFee(providerAddress, outputFee)

            await this.settleFee(providerAddress, outputFee)

            const svc = await extractor.getSvcInfo()
            if (!isVerifiability(svc.verifiability)) {
                return false
            }

            if (!chatID) {
                throw new Error('Chat ID does not exist')
            }

            let singerRAVerificationResult =
                await this.verifier.getSigningAddress(providerAddress)

            if (!singerRAVerificationResult.valid) {
                singerRAVerificationResult =
                    await this.verifier.getSigningAddress(providerAddress, true)
            }

            if (!singerRAVerificationResult.valid) {
                throw new Error('Signing address is invalid')
            }

            const ResponseSignature = await Verifier.fetSignatureByChatID(
                svc.url,
                chatID,
                svc.model
            )

            return Verifier.verifySignature(
                ResponseSignature.text,
                ResponseSignature.signature,
                singerRAVerificationResult.signingAddress
            )
        } catch (error) {
            throw error
        }
    }

    private async calculateOutputFees(
        extractor: Extractor,
        content: string
    ): Promise<bigint> {
        const svc = await extractor.getSvcInfo()
        const outputCount = await extractor.getOutputCount(content)
        return BigInt(outputCount) * svc.outputPrice
    }
}
