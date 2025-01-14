import { InferenceServingContract } from '../../contract/inference'
import { Extractor } from '../extractor'
import { Cache, Metadata } from '../storage'
import { ZGServingUserBrokerBase } from './base'
import { isVerifiability, VerifiabilityEnum } from './model'
import { Verifier } from './verifier'

/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export class ResponseProcessor extends ZGServingUserBrokerBase {
    private verifier: Verifier

    constructor(
        contract: InferenceServingContract,
        metadata: Metadata,
        cache: Cache
    ) {
        super(contract, metadata, cache)
        this.contract = contract
        this.metadata = metadata
        this.verifier = new Verifier(contract, metadata, cache)
    }

    async settleFeeWithA0gi(
        providerAddress: string,
        serviceName: string,
        fee: number
    ): Promise<void> {
        if (!fee) {
            return
        }
        await this.settleFee(
            providerAddress,
            serviceName,
            this.a0giToNeuron(fee)
        )
    }

    /**
     * settleFee sends an empty request to the service provider to settle the fee.
     */
    async settleFee(
        providerAddress: string,
        serviceName: string,
        fee: bigint
    ): Promise<void> {
        try {
            if (!fee) {
                return
            }
            const service = await this.contract.getService(
                providerAddress,
                serviceName
            )
            if (!service) {
                throw new Error('Service is not available')
            }

            const { provider, name, url } = service
            const headers = await this.getHeader(provider, name, '', fee)

            const response = await fetch(`${url}/v1/proxy/${name}/settle-fee`, {
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
        svcName: string,
        content: string,
        chatID?: string
    ): Promise<boolean | null> {
        try {
            let extractor: Extractor
            extractor = await this.getExtractor(providerAddress, svcName)
            const outputFee = await this.calculateOutputFees(extractor, content)

            await this.settleFee(providerAddress, svcName, outputFee)

            const svc = await extractor.getSvcInfo()
            // TODO: Temporarily return true for non-TeeML verifiability.
            // these cases will be handled in the future.
            if (
                isVerifiability(svc.verifiability) ||
                svc.verifiability !== VerifiabilityEnum.TeeML
            ) {
                return true
            }

            if (!chatID) {
                throw new Error('Chat ID does not exist')
            }

            let singerRAVerificationResult =
                await this.verifier.getSigningAddress(providerAddress, svcName)

            if (!singerRAVerificationResult.valid) {
                singerRAVerificationResult =
                    await this.verifier.getSigningAddress(
                        providerAddress,
                        svcName,
                        true
                    )
            }

            if (!singerRAVerificationResult.valid) {
                throw new Error('Signing address is invalid')
            }

            const ResponseSignature = await Verifier.fetSignatureByChatID(
                svc.url,
                svcName,
                chatID
            )

            return Verifier.verifySignature(
                ResponseSignature.text,
                `0x${ResponseSignature.signature}`,
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
