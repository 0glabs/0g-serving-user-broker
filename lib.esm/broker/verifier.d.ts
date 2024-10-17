import { ZGServingUserBrokerBase } from './base';
export interface ResponseSignature {
    text: string;
    signature: string;
}
export interface SignerRA {
    signing_address: string;
    nvidia_payload: string;
}
export interface SingerRAVerificationResult {
    /**
     * signer RA 是否合法
     */
    valid: boolean;
    /**
     * singer 的 signing 地址。
     */
    signingAddress: string;
}
/**
 * Verifier 中包含服务可靠性验证的方法。
 */
export declare class Verifier extends ZGServingUserBrokerBase {
    /**
     * getAndVerifySigningAddress 验证 signer 的 signing address 对应的 RA 是否合法。
     * 同时将 RA 的 signing address 保存在本地后返回。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @returns 第一返回为布尔值。True 代表返回 signer RA 合法，反之不合法。第二个返回为 signer 的 signer 的 signing address。
     */
    getAndVerifySigningAddress(providerAddress: string, svcName: string): Promise<SingerRAVerificationResult>;
    /**
     * getSigningAddress 返回 signing address。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @returns 第一返回为布尔值。True 代表返回 signer RA 合法，反之不合法。第二个返回为 signer 的 address。
     */
    getSigningAddress(providerAddress: string, svcName: string): Promise<string>;
    private verifyRA;
    static fetSignerRA(providerBrokerURL: string, svcName: string): Promise<SignerRA>;
    static fetSignatureByChatID(providerBrokerURL: string, svcName: string, chatID: string): Promise<ResponseSignature>;
    static verifySignature(message: string, signature: string, expectedAddress: string): boolean;
}
//# sourceMappingURL=verifier.d.ts.map