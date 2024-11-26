import { JsonRpcSigner, Wallet } from 'ethers';
export declare function encryptData(signer: JsonRpcSigner | Wallet, data: string): Promise<string>;
export declare function decryptData(signer: JsonRpcSigner | Wallet, encryptedData: string): Promise<string>;
//# sourceMappingURL=encrypt.d.ts.map