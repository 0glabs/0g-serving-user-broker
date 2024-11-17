declare class Metadata {
    private static isBrowser;
    private static nodeStorageFilePath;
    private static nodeStorage;
    private static initialized;
    static initialize(): Promise<void>;
    private static loadNodeStorage;
    private static saveNodeStorage;
    private static setItem;
    private static getItem;
    static storeNonce(key: string, value: number): void;
    static storeOutputFee(key: string, value: number): void;
    static storeZKPrivateKey(key: string, value: bigint[]): void;
    static storeSigningKey(key: string, value: string): void;
    static getNonce(key: string): number | null;
    static getOutputFee(key: string): number | null;
    static getZKPrivateKey(key: string): bigint[] | null;
    static getSigningKey(key: string): string | null;
}
export { Metadata };
//# sourceMappingURL=metadata.d.ts.map