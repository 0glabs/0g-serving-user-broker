"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseProcessor = void 0;
const storage_1 = require("../storage");
const base_1 = require("./base");
const verifier_1 = require("./verifier");
/**
 * ResponseProcessor 为 ZGServingUserBroker 的子类
 * 需要用 createZGServingUserBroker 初始化 ZGServingUserBroker
 * 后使用
 */
class ResponseProcessor extends base_1.ZGServingUserBrokerBase {
    /**
     * processResponse 在 user 使用 provider service 成功获取返回后使用。
     * processResponse 通过检测 provider service 返回内容和对应签名判断返回内容是否合法。
     *
     * 同时，processResponse 从返回中获取一些必要信息，记录在 localStorage 用于后续请求的计费 header 生成。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @param content - 服务返回的主体。例如，chatbot 类型的服务下就是服务返回回答文字。
     * @returns 一个布尔值。True 代表返回内容合法，反之不合法。
     */
    async processResponse(providerAddress, svcName, content, chatID) {
        const extractor = await this.getExtractor(providerAddress, svcName);
        const outputFee = await this.calculateOutputFees(extractor, content);
        storage_1.Metadata.storeOutputFee(this.contract.getUserAddress() + providerAddress, outputFee);
        const signingAddress = storage_1.Metadata.getSigningKey(this.contract.getUserAddress() + providerAddress + svcName);
        if (!signingAddress) {
            const error = new Error('signing key does not exist, make sure the signer of the service has been verified');
            console.error(error.message);
            throw error;
        }
        let svc;
        try {
            svc = await this.getService(providerAddress, svcName);
        }
        catch (error) {
            console.error(error.message);
            throw error;
        }
        const ResponseSignature = await verifier_1.Verifier.fetSignatureByChatID(svc.url, svcName, chatID);
        return verifier_1.Verifier.verifySignature(ResponseSignature.text, `0x${ResponseSignature.signature}`, signingAddress);
    }
    async calculateOutputFees(extractor, content) {
        const svc = await extractor.getSvcInfo();
        const outputCount = await extractor.getOutputCount(content);
        return outputCount * Number(svc.outputPrice);
    }
}
exports.ResponseProcessor = ResponseProcessor;
//# sourceMappingURL=response.js.map