import { BabyJub, Eddsa, PedersenHash, Signature, Point, buildBabyjub, buildEddsa, buildPedersenHash } from 'circomlibjs';

type PrivateKey = Uint8Array;
type PublicKey = Point;
type Message = Uint8Array;
type Hash = Uint8Array;
type SignatureBuffer = Uint8Array;
type PointBuffer = Uint8Array;

let eddsa: Eddsa;
let babyjubjub: BabyJub;
let pedersenHash: PedersenHash;

async function initBabyJub(): Promise<void> {
    if (!babyjubjub) {
        babyjubjub = await buildBabyjub();
    }
}

async function initEddsa(): Promise<void> {
    if (!eddsa) {
        eddsa = await buildEddsa();
    }
}

async function initPedersenHash(): Promise<void> {
    if (!pedersenHash) {
        pedersenHash = await buildPedersenHash();
    }
}

async function babyJubJubGeneratePrivateKey(): Promise<PrivateKey> {
    await initBabyJub();
    return babyjubjub.F.random();
}

async function babyJubJubGeneratePublicKey(privateKey: PrivateKey): Promise<Point> {
    await initEddsa();
    return eddsa.prv2pub(privateKey);
}

async function babyJubJubSignature(msg: Message, privateKey: PrivateKey): Promise<Signature> {
    await initEddsa();
    return eddsa.signPedersen(privateKey, msg);
}

async function babyJubJubVerify(
    msg: Message,
    signature: Signature,
    publicKey: PublicKey
): Promise<boolean> {
    await initEddsa();
    return eddsa.verifyPedersen(msg, signature, publicKey);
}

async function packSignature(signature: Signature): Promise<SignatureBuffer> {
    await initEddsa();
    return eddsa.packSignature(signature);
}

async function packPoint(point: Point): Promise<PointBuffer> {
    await initBabyJub();
    return babyjubjub.packPoint(point);
}

async function unpackPoint(buffer: PointBuffer): Promise<Point> {
    await initBabyJub();
    return babyjubjub.unpackPoint(buffer);
}

async function hash(msg: Message): Promise<Hash> {
    await initPedersenHash();
    return pedersenHash.hash(msg);
}

async function unpackSignature(signBuff: SignatureBuffer): Promise<Signature> {
    await initEddsa();
    return eddsa.unpackSignature(signBuff);
}

export {
    babyJubJubGeneratePrivateKey,
    babyJubJubGeneratePublicKey,
    babyJubJubSignature,
    babyJubJubVerify,
    packSignature,
    packPoint,
    hash,
    unpackSignature,
    unpackPoint,
    PrivateKey,
    PublicKey,
    Message,
    Hash,
    Signature,
    SignatureBuffer,
    PointBuffer,
};