export declare class Metadata {
    private nodeStorage;
    private initialized;
    constructor();
    initialize(): Promise<void>;
    private setItem;
    private getItem;
    storeSettleSignerPrivateKey(key: string, value: bigint[]): Promise<void>;
    storeSigningKey(key: string, value: string): Promise<void>;
    getSettleSignerPrivateKey(key: string): Promise<bigint[] | null>;
    getSigningKey(key: string): Promise<string | null>;
}
//# sourceMappingURL=metadata.d.ts.map