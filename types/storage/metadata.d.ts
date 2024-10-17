export declare class Metadata {
    static storeNonce(key: string, value: number): void;
    static storeOutputFee(key: string, value: number): void;
    static storePrivateKey(key: string, value: bigint[]): void;
    static storeSigningKey(key: string, value: string): void;
    static getNonce(key: string): number | null;
    static getOutputFee(key: string): number | null;
    static getPrivateKey(key: string): bigint[] | null;
    static getSigningKey(key: string): string | null;
}
export declare function getMetaData(key: string): {
    nonce: number | null;
    outputFee: number | null;
    privateKey: bigint[] | null;
};
//# sourceMappingURL=metadata.d.ts.map