import { ServiceStructOutput } from '../contract'
import { Extractor } from '../extractor'
import { Metadata } from '../storage'
import { ZGServingUserBrokerBase } from './base'
import { Verifier } from './verifier'

/**
 * ResponseProcessor 为 ZGServingUserBroker 的子类
 * 需要用 createZGServingUserBroker 初始化 ZGServingUserBroker
 * 后使用
 */
export class ResponseProcessor extends ZGServingUserBrokerBase {
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
    async processResponse(
        providerAddress: string,
        svcName: string,
        content: string,
        chatID: string
    ): Promise<boolean> {
        const extractor = await this.getExtractor(providerAddress, svcName)
        const outputFee = await this.calculateOutputFees(extractor, content)
        Metadata.storeOutputFee(
            this.contract.getUserAddress() + providerAddress,
            outputFee
        )

        const signingAddress = Metadata.getSigningKey(
            this.contract.getUserAddress() + providerAddress + svcName
        )
        if (!signingAddress) {
            const error = new Error(
                'signing key does not exist, make sure the signer of the service has been verified'
            )
            console.error(error.message)
            throw error
        }

        let svc: ServiceStructOutput
        try {
            svc = await this.getService(providerAddress, svcName)
        } catch (error) {
            console.error((error as Error).message)
            throw error
        }

        const ResponseSignature = await Verifier.fetSignatureByChatID(
            svc.url,
            svcName,
            chatID
        )

        return Verifier.verifySignature(
            ResponseSignature.text,
            `0x${ResponseSignature.signature}`,
            signingAddress
        )
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
