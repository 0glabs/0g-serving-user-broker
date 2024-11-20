import { Request } from './request';
import { Point } from 'circomlibjs';
type PublicKey = Point;
type SignatureBuffer = Uint8Array;
type ProofInput = {
    signer: Point;
    serializedRequest: Uint8Array[];
    r8: Uint8Array[];
    s: Uint8Array[];
};
export declare function generateProofInput(requests: Request[], l: number, pubkey: PublicKey, signBuff: SignatureBuffer[]): Promise<ProofInput>;
type SignVerifyResult = {
    packPubkey: Uint8Array;
    r8: Uint8Array[];
    s: Uint8Array[];
};
export declare function signAndVerifyRequests(requests: Request[], babyJubJubPrivateKey: Uint8Array, babyJubJubPublicKey: PublicKey): Promise<SignVerifyResult>;
export declare function signRequests(requests: Request[], babyJubJubPrivateKey: Uint8Array): Promise<SignatureBuffer[]>;
export declare function verifySig(requests: Request[], signatures: SignatureBuffer[], pubkey: PublicKey): Promise<boolean[]>;
export declare function genPubkey(privkey: Uint8Array): Promise<PublicKey>;
export {};
//# sourceMappingURL=helper.d.ts.map