import { Signature, Point } from 'circomlibjs';
type PrivateKey = Uint8Array;
type PublicKey = Point;
type Message = Uint8Array;
type Hash = Uint8Array;
type SignatureBuffer = Uint8Array;
type PointBuffer = Uint8Array;
declare function babyJubJubGeneratePrivateKey(): Promise<PrivateKey>;
declare function babyJubJubGeneratePublicKey(privateKey: PrivateKey): Promise<Point>;
declare function babyJubJubSignature(msg: Message, privateKey: PrivateKey): Promise<Signature>;
declare function babyJubJubVerify(msg: Message, signature: Signature, publicKey: PublicKey): Promise<boolean>;
declare function packSignature(signature: Signature): Promise<SignatureBuffer>;
declare function packPoint(point: Point): Promise<PointBuffer>;
declare function unpackPoint(buffer: PointBuffer): Promise<Point>;
declare function hash(msg: Message): Promise<Hash>;
declare function unpackSignature(signBuff: SignatureBuffer): Promise<Signature>;
export { babyJubJubGeneratePrivateKey, babyJubJubGeneratePublicKey, babyJubJubSignature, babyJubJubVerify, packSignature, packPoint, hash, unpackSignature, unpackPoint, PrivateKey, PublicKey, Message, Hash, Signature, SignatureBuffer, PointBuffer, };
//# sourceMappingURL=crypto.d.ts.map