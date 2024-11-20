import { Signature, Point } from 'circomlibjs';
declare function babyJubJubGeneratePrivateKey(): Promise<Uint8Array>;
declare function babyJubJubGeneratePublicKey(privateKey: Uint8Array | string): Promise<Point>;
declare function babyJubJubSignature(msg: Uint8Array, privateKey: Uint8Array | string): Promise<Signature>;
declare function babyJubJubVerify(msg: Uint8Array, signature: Signature, publicKey: Point): Promise<boolean>;
declare function packSignature(signature: Signature): Promise<Uint8Array>;
declare function packPoint(point: Point): Promise<Uint8Array>;
declare function unpackPoint(buffer: Uint8Array): Promise<Point>;
declare function hash(msg: Uint8Array): Promise<Uint8Array>;
declare function unpackSignature(signBuff: Uint8Array): Promise<Signature>;
export { babyJubJubGeneratePrivateKey, babyJubJubGeneratePublicKey, babyJubJubSignature, babyJubJubVerify, packSignature, packPoint, hash, unpackSignature, unpackPoint, };
//# sourceMappingURL=crypto.d.ts.map