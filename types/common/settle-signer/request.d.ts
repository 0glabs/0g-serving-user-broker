export declare class Request {
    private nonce;
    private fee;
    private userAddress;
    private providerAddress;
    constructor(nonce: string, fee: string, userAddress: string, // hexstring format with '0x' prefix
    providerAddress: string);
    serialize(): Uint8Array;
    static deserialize(byteArray: Uint8Array): Request;
    getNonce(): bigint;
    getFee(): bigint;
    getUserAddress(): bigint;
    getProviderAddress(): bigint;
}
//# sourceMappingURL=request.d.ts.map