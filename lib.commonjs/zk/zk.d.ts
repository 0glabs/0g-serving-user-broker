export interface ZKRequest {
    fee: string;
    nonce: string;
    providerAddress: string;
    userAddress: string;
}
export declare function createKey(): Promise<[
    [bigint, bigint],
    [bigint, bigint]
]>;
export declare function sign(requests: any, privateKey: bigint[]): Promise<string>;
//# sourceMappingURL=zk.d.ts.map