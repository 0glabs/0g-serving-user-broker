export declare class Metadata {
    static storeNonce(key: string, value: number): void;
    static storeOutputFee(key: string, value: number): void;
    static storeZKPrivateKey(key: string, value: bigint[]): void;
    static storeSigningKey(key: string, value: string): void;
    static getNonce(key: string): number | null;
    static getOutputFee(key: string): number | null;
    static getZKPrivateKey(key: string): bigint[] | null;
    static getSigningKey(key: string): string | null;
}
//# sourceMappingURL=metadata.d.ts.map