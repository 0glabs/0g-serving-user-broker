export declare class Request {
    private nonce;
    private fee;
    private userAddress;
    private providerAddress;
    constructor(nonce: string | number, fee: string | number, userAddress: string, // hexstring format with '0x' prefix
    providerAddress: string);
    serialize(): Uint8Array;
    static deserialize(byteArray: Uint8Array): Request;
    getNonce(): number;
    getFee(): bigint;
    getUserAddress(): bigint;
    getProviderAddress(): bigint;
}
//# sourceMappingURL=request.d.ts.map