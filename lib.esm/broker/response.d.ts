import { ZGServingUserBrokerBase } from './base';
/**
 * ResponseProcessor 为 ZGServingUserBroker 的子类
 * 需要用 createZGServingUserBroker 初始化 ZGServingUserBroker
 * 后使用
 */
export declare class ResponseProcessor extends ZGServingUserBrokerBase {
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
    processResponse(providerAddress: string, svcName: string, content: string, chatID: string): Promise<boolean>;
    private calculateOutputFees;
}
//# sourceMappingURL=response.d.ts.map