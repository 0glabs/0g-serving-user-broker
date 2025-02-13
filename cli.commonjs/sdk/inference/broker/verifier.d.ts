import { ZGServingUserBrokerBase } from './base';
export interface ResponseSignature {
    text: string;
    signature: string;
}
export interface SignerRA {
    signing_address: string;
    nvidia_payload: string;
    intel_quote: string;
}
export interface SingerRAVerificationResult {
    /**
     * Whether the signer RA is valid
     * null means the RA has not been verified
     */
    valid: boolean | null;
    /**
     * The signing address of the signer
     */
    signingAddress: string;
}
/**
 * The Verifier class contains methods for verifying service reliability.
 */
export declare class Verifier extends ZGServingUserBrokerBase {
    verifyService(providerAddress: string): Promise<boolean | null>;
    /**
     * getSigningAddress verifies whether the signing address
     * of the signer corresponds to a valid RA.
     *
     * It also stores the signing address of the RA in
     * localStorage and returns it.
     *
     * @param providerAddress - provider address.
     * @param verifyRA - whether to verify the RA， default is false.
     * @returns The first return value indicates whether the RA is valid,
     * and the second return value indicates the signing address of the RA.
     */
    getSigningAddress(providerAddress: string, verifyRA?: boolean): Promise<SingerRAVerificationResult>;
    getSignerRaDownloadLink(providerAddress: string): Promise<string>;
    getChatSignatureDownloadLink(providerAddress: string, chatID: string): Promise<string>;
    static verifyRA(nvidia_payload: any): Promise<boolean>;
    static fetSignerRA(providerBrokerURL: string, model: string): Promise<SignerRA>;
    static fetSignatureByChatID(providerBrokerURL: string, chatID: string, model: string): Promise<ResponseSignature>;
    static verifySignature(message: string, signature: string, expectedAddress: string): boolean;
}
//# sourceMappingURL=verifier.d.ts.map