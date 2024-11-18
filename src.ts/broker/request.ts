import { Extractor } from '../extractor'
import { sign } from '../zk'
// import { Request } from '0g-zk-settlement-client'
import { REQUEST_LENGTH } from './const'
import { ZGServingUserBrokerBase } from './base'

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
        content: string,
        settlementKey?: string
    ): Promise<ServingRequestHeaders> {
        let extractor: Extractor
        let sig: string

        try {
            extractor = await this.getExtractor(providerAddress, svcName)

            let { nonce, outputFee, zkPrivateKey } = await this.getProviderData(
                providerAddress
            )

            if (settlementKey) {
                zkPrivateKey = JSON.parse(settlementKey).map((num: string) =>
                    BigInt(num)
                )
            }

            if (!zkPrivateKey) {
                throw new Error('Miss private key for signing request')
            }

            const updatedNonce = !nonce ? 1 : nonce + REQUEST_LENGTH
            const key = this.contract.getUserAddress() + providerAddress
            this.metadata.storeNonce(key, updatedNonce)

            const { fee, inputFee } = await this.calculateFees(
                extractor,
                content,
                outputFee
            )

            // const zkInput = new Request(
            //     updatedNonce.toString(),
            //     fee.toString(),
            //     this.contract.getUserAddress(),
            //     providerAddress
            // )

            const zkInput = {
                nonce: updatedNonce,
                fee: fee,
                userAddress: this.contract.getUserAddress(),
                providerAddress: providerAddress,
            }

            sig = await sign([zkInput], zkPrivateKey)

            return {
                'X-Phala-Signature-Type': 'StandaloneApi',
                Address: this.contract.getUserAddress(),
                Fee: zkInput.fee.toString(),
                'Input-Fee': inputFee.toString(),
                Nonce: zkInput.nonce.toString(),
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
