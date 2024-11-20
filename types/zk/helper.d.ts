import { PublicKey, SignatureBuffer, PrivateKey, PointBuffer } from './crypto';
import { Request } from './request';
export declare const FIELD_SIZE = 32;
type ProofInput = {
    signer: PublicKey;
    serializedRequest: Uint8Array[];
    r8: Uint8Array[];
    s: Uint8Array[];
};
export declare function generateProofInput(requests: Request[], l: number, pubkey: PublicKey, signBuff: SignatureBuffer[]): Promise<ProofInput>;
type PackedSignerAndSignatures = {
    packPubkey: PointBuffer;
    r8: SignatureBuffer[];
    s: SignatureBuffer[];
};
export declare function signAndVerifyRequests(requests: Request[], privateKey: PrivateKey, publicKey: PublicKey): Promise<PackedSignerAndSignatures>;
export declare function signRequests(requests: Request[], privateKey: PrivateKey): Promise<SignatureBuffer[]>;
export declare function verifySig(requests: Request[], packedSignatures: SignatureBuffer[], publicKey: PublicKey): Promise<boolean[]>;
export declare function genPubkey(privkey: PrivateKey): Promise<PublicKey>;
export {};
//# sourceMappingURL=helper.d.ts.map