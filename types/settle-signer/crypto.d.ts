import { Signature, Point } from 'circomlibjs';
type PrivateKey = Uint8Array;
type Message = Uint8Array;
type Hash = Uint8Array;
type SignatureBuffer = Uint8Array;
type PointBuffer = Uint8Array;
declare function babyJubJubGeneratePrivateKey(): Promise<PrivateKey>;
declare function babyJubJubGeneratePublicKey(privateKey: PrivateKey): Promise<Point>;
declare function babyJubJubSignature(msg: Message, privateKey: PrivateKey): Promise<Signature>;
declare function packSignature(signature: Signature): Promise<SignatureBuffer>;
declare function packPoint(point: Point): Promise<PointBuffer>;
export { babyJubJubGeneratePrivateKey, babyJubJubGeneratePublicKey, babyJubJubSignature, packSignature, packPoint, PrivateKey, Message, Hash, Signature, SignatureBuffer, PointBuffer, };
//# sourceMappingURL=crypto.d.ts.map