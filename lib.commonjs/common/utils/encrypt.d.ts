import { AddressLike, BigNumberish, JsonRpcSigner, Wallet } from 'ethers';
export declare function encryptData(signer: JsonRpcSigner | Wallet, data: string): Promise<string>;
export declare function decryptData(signer: JsonRpcSigner | Wallet, encryptedData: string): Promise<string>;
export declare function signRequest(signer: Wallet, userAddress: AddressLike, nonce: BigNumberish, datasetRootHash: string, fee: BigNumberish): Promise<string>;
export declare function eciesDecrypt(signer: Wallet, encryptedData: string): Promise<string>;
export declare function aesGCMDecrypt(key: string, encryptedData: string, providerAddress: string): Promise<string>;
//# sourceMappingURL=encrypt.d.ts.map