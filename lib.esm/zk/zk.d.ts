export interface ZKRequest {
    fee: number;
    nonce: number;
    providerAddress: string;
    userAddress: string;
}
export declare function createKey(): Promise<bigint[]>;
export declare function sign(requests: any, privateKey: bigint[]): Promise<string>;
//# sourceMappingURL=zk.d.ts.map