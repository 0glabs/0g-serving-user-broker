import { Metadata } from '../storage';
import { sign } from '../zk';
import { Request } from '0g-zk-settlement-client';
import { REQUEST_LENGTH } from './const';
import { ZGServingUserBrokerBase } from './base';
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
export class RequestProcessor extends ZGServingUserBrokerBase {
    async processRequest(providerAddress, svcName, content) {
        let extractor;
        let sig;
        try {
            extractor = await this.getExtractor(providerAddress, svcName);
            const { nonce, outputFee, zkPrivateKey } = await this.getProviderData(providerAddress);
            if (!zkPrivateKey) {
                throw new Error('Miss private key for signing request');
            }
            const updatedNonce = !nonce ? 1 : nonce + REQUEST_LENGTH;
            const key = this.contract.getUserAddress() + providerAddress;
            Metadata.storeNonce(key, updatedNonce);
            const { fee, inputFee } = await this.calculateFees(extractor, content, outputFee);
            const zkInput = new Request(updatedNonce.toString(), fee.toString(), this.contract.getUserAddress(), providerAddress);
            sig = await sign([zkInput], zkPrivateKey);
            return {
                'X-Phala-Signature-Type': 'StandaloneApi',
                Address: this.contract.getUserAddress(),
                Fee: zkInput.fee.toString(),
                'Input-Fee': inputFee.toString(),
                Nonce: zkInput.nonce.toString(),
                'Previous-Output-Fee': (outputFee ?? 0).toString(),
                'Service-Name': svcName,
                Signature: sig,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async calculateFees(extractor, content, outputFee) {
        const svc = await extractor.getSvcInfo();
        const inputCount = await extractor.getInputCount(content);
        const inputFee = inputCount * Number(svc.inputPrice);
        const fee = inputFee + (outputFee ?? 0);
        return { fee, inputFee };
    }
}
//# sourceMappingURL=request.js.map