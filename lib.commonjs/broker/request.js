"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestProcessor = void 0;
const settle_signer_1 = require("../settle-signer");
const const_1 = require("../const");
const base_1 = require("./base");
const settle_signer_2 = require("../settle-signer");
const encrypt_1 = require("../utils/encrypt");
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
class RequestProcessor extends base_1.ZGServingUserBrokerBase {
    async processRequest(providerAddress, svcName, content) {
        let extractor;
        let sig;
        try {
            extractor = await this.getExtractor(providerAddress, svcName);
            let { nonce, outputFee, settleSignerPrivateKey } = await this.getProviderData(providerAddress);
            const key = `${this.contract.getUserAddress()}_${providerAddress}`;
            if (!settleSignerPrivateKey) {
                const account = await this.contract.getAccount(providerAddress);
                const settleSignerPrivateKeyStr = await (0, encrypt_1.decryptData)(this.contract.signer, account.additionalInfo);
                settleSignerPrivateKey = (0, encrypt_1.stringToSettleSignerPrivateKey)(settleSignerPrivateKeyStr);
                this.metadata.storeSettleSignerPrivateKey(key, settleSignerPrivateKey);
            }
            const updatedNonce = !nonce ? 1 : nonce + const_1.REQUEST_LENGTH;
            this.metadata.storeNonce(key, updatedNonce);
            const { fee, inputFee } = await this.calculateFees(extractor, content, outputFee);
            const request = new settle_signer_2.Request(updatedNonce.toString(), fee.toString(), this.contract.getUserAddress(), providerAddress);
            const settleSignature = await (0, settle_signer_1.signData)([request], settleSignerPrivateKey);
            sig = JSON.stringify(Array.from(settleSignature[0]));
            return {
                'X-Phala-Signature-Type': 'StandaloneApi',
                Address: this.contract.getUserAddress(),
                Fee: fee.toString(),
                'Input-Fee': inputFee.toString(),
                Nonce: updatedNonce.toString(),
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
exports.RequestProcessor = RequestProcessor;
//# sourceMappingURL=request.js.map