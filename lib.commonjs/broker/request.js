"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestProcessor = void 0;
const storage_1 = require("../storage");
const zk_1 = require("../zk");
const _0g_zk_settlement_client_1 = require("0g-zk-settlement-client");
const const_1 = require("./const");
const base_1 = require("./base");
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
            const { nonce, outputFee, zkPrivateKey } = await this.getProviderData(providerAddress);
            if (!zkPrivateKey) {
                throw new Error('Miss private key for signing request');
            }
            const updatedNonce = !nonce ? 1 : nonce + const_1.REQUEST_LENGTH;
            const key = this.contract.getUserAddress() + providerAddress;
            storage_1.Metadata.storeNonce(key, updatedNonce);
            const { fee, inputFee } = await this.calculateFees(extractor, content, outputFee);
            const zkInput = new _0g_zk_settlement_client_1.Request(updatedNonce.toString(), fee.toString(), this.contract.getUserAddress(), providerAddress);
            sig = await (0, zk_1.sign)([zkInput], zkPrivateKey);
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
exports.RequestProcessor = RequestProcessor;
//# sourceMappingURL=request.js.map