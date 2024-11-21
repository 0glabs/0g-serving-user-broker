import { Extractor } from '../extractor'
import { signData } from '../settle-signer'
import { REQUEST_LENGTH } from '../const'
import { ZGServingUserBrokerBase } from './base'
import { Request, PackedPrivkey } from '../settle-signer'
import { decryptData, stringToSettleSignerPrivateKey } from '../utils/encrypt'

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
     * Service name
     */
    'Service-Name': string
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
    async processRequest(
        providerAddress: string,
        svcName: string,
        content: string
    ): Promise<ServingRequestHeaders> {
        let extractor: Extractor
        let sig: string

        try {
            extractor = await this.getExtractor(providerAddress, svcName)

            let { nonce, outputFee, settleSignerPrivateKey } =
                await this.getProviderData(providerAddress)

            const key = `${this.contract.getUserAddress()}_${providerAddress}`

            if (!settleSignerPrivateKey) {
                const account = await this.contract.getAccount(providerAddress)
                const settleSignerPrivateKeyStr = await decryptData(
                    this.contract.signer,
                    account.additionalInfo
                )
                settleSignerPrivateKey = stringToSettleSignerPrivateKey(
                    settleSignerPrivateKeyStr
                )
                this.metadata.storeSettleSignerPrivateKey(
                    key,
                    settleSignerPrivateKey
                )
            }
            const updatedNonce = !nonce ? 1 : nonce + REQUEST_LENGTH
            this.metadata.storeNonce(key, updatedNonce)

            const { fee, inputFee } = await this.calculateFees(
                extractor,
                content,
                outputFee
            )

            const request = new Request(
                updatedNonce.toString(),
                fee.toString(),
                this.contract.getUserAddress(),
                providerAddress
            )

            const settleSignature = await signData(
                [request],
                settleSignerPrivateKey as PackedPrivkey
            )
            sig = JSON.stringify(Array.from(settleSignature[0]))

            return {
                'X-Phala-Signature-Type': 'StandaloneApi',
                Address: this.contract.getUserAddress(),
                Fee: fee.toString(),
                'Input-Fee': inputFee.toString(),
                Nonce: updatedNonce.toString(),
                'Previous-Output-Fee': (outputFee ?? 0).toString(),
                'Service-Name': svcName,
                Signature: sig,
            }
        } catch (error) {
            throw error
        }
    }

    private async calculateFees(
        extractor: Extractor,
        content: string,
        outputFee: number | null
    ) {
        const svc = await extractor.getSvcInfo()
        const inputCount = await extractor.getInputCount(content)
        const inputFee = inputCount * Number(svc.inputPrice)
        const fee = inputFee + (outputFee ?? 0)
        return { fee, inputFee }
    }
}
