export declare class Metadata {
    private nodeStorage;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    private setItem;
    private getItem;
    storeNonce(key: string, value: number): Promise<void>;
    storeSettleSignerPrivateKey(key: string, value: bigint[]): Promise<void>;
    storeSigningKey(key: string, value: string): Promise<void>;
    getNonce(key: string): Promise<number | null>;
    getSettleSignerPrivateKey(key: string): Promise<bigint[] | null>;
    getSigningKey(key: string): Promise<string | null>;
}
//# sourceMappingURL=metadata.d.ts.map