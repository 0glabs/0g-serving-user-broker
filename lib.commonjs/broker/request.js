"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestProcessor = void 0;
const storage_1 = require("../storage");
const zk_1 = require("../zk");
const base_1 = require("./base");
const const_1 = require("./const");
/**
 * RequestProcessor 为 ZGServingUserBroker 的子类
 * 需要用 createZGServingUserBroker 初始化 ZGServingUserBroker
 * 后使用
 */
class RequestProcessor extends base_1.ZGServingUserBrokerBase {
    /**
     * processRequest 在 user 使用 provider service 时，
     * 为请求生成计费相关的 headers。
     *
     * 0G Serving 体系下，具备合法计费 headers 的请求（request）被视作结算凭证，
     * 将被 provider 用于合约上结算。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @param content - 被计费的主体。例如，chatbot 类型的服务下就是用户输入的文字。
     * @returns headers。记录着请求的费用、用户签名等信息。
     */
    async processRequest(providerAddress, svcName, content) {
        const extractor = await this.getExtractor(providerAddress, svcName);
        const { nonce, outputFee, privateKey } = await this.getProviderData(providerAddress);
        const updatedNonce = !nonce ? 1 : nonce + const_1.REQUEST_LENGTH;
        storage_1.Metadata.storeNonce(providerAddress, updatedNonce);
        const svcPrivateKey = privateKey ?? (await this.createAndStoreKey(providerAddress));
        const { fee, inputFee } = await this.calculateFees(extractor, content, outputFee);
        const zkInput = {
            fee,
            nonce: updatedNonce,
            providerAddress,
            userAddress: this.contract.getUserAddress(),
        };
        const sig = await (0, zk_1.sign)(zkInput, svcPrivateKey);
        return {
            Address: this.contract.getUserAddress(),
            Fee: zkInput.fee.toString(),
            'Input-Fee': inputFee.toString(),
            Nonce: zkInput.nonce.toString(),
            'Previous-Output-Fee': (outputFee ?? 0).toString(),
            'Service-Name': svcName,
            Signature: sig,
        };
    }
    async createAndStoreKey(providerAddress) {
        const privateKey = await (0, zk_1.createKey)();
        storage_1.Metadata.storePrivateKey(providerAddress, privateKey);
        return privateKey;
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