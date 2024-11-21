import { JsonRpcSigner, Wallet } from 'ethers';
import { PackedPrivkey } from '../settle-signer';
export declare function encryptData(signer: JsonRpcSigner | Wallet, data: string): Promise<string>;
export declare function decryptData(signer: JsonRpcSigner | Wallet, encryptedData: string): Promise<string>;
export declare function stringToSettleSignerPrivateKey(str: string): PackedPrivkey;
export declare function settlePrivateKeyToString(key: PackedPrivkey): string;
//# sourceMappingURL=encrypt.d.ts.map