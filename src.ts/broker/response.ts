import { ServingContract } from '../contract'
import { Extractor } from '../extractor'
import { Metadata } from '../storage'
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

    constructor(contract: ServingContract) {
        super(contract)
        this.contract = contract
        this.verifier = new Verifier(contract)
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
            Metadata.storeOutputFee(
                this.contract.getUserAddress() + providerAddress,
                outputFee
            )

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
    ): Promise<number> {
        const svc = await extractor.getSvcInfo()
        const outputCount = await extractor.getOutputCount(content)
        return outputCount * Number(svc.outputPrice)
    }
}
