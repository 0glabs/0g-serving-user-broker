"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestProcessor = void 0;
const zk_1 = require("../zk");
const const_1 = require("./const");
const base_1 = require("./base");
const zk_2 = require("../zk");
/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
class RequestProcessor extends base_1.ZGServingUserBrokerBase {
    async processRequest(providerAddress, svcName, content, settlementKey) {
        let extractor;
        let sig;
        try {
            extractor = await this.getExtractor(providerAddress, svcName);
            let { nonce, outputFee, zkPrivateKey } = await this.getProviderData(providerAddress);
            if (settlementKey) {
                zkPrivateKey = JSON.parse(settlementKey).map((num) => BigInt(num));
            }
            if (!zkPrivateKey) {
                throw new Error('Miss private key for signing request');
            }
            const updatedNonce = !nonce ? 1 : nonce + const_1.REQUEST_LENGTH;
            const key = `${this.contract.getUserAddress()}_${providerAddress}`;
            this.metadata.storeNonce(key, updatedNonce);
            const { fee, inputFee } = await this.calculateFees(extractor, content, outputFee);
            const zkInput = new zk_2.Request(updatedNonce.toString(), fee.toString(), this.contract.getUserAddress(), providerAddress);
            const zkSig = await (0, zk_1.signData)([zkInput], zkPrivateKey);
            sig = JSON.stringify(Array.from(zkSig[0]));
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