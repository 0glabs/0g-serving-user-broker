import {
    BabyJub,
    Eddsa,
    Signature,
    Point,
    buildBabyjub,
    buildEddsa,
} from 'circomlibjs'

type PrivateKey = Uint8Array
type Message = Uint8Array
type Hash = Uint8Array
type SignatureBuffer = Uint8Array
type PointBuffer = Uint8Array

let eddsa: Eddsa
let babyjubjub: BabyJub

async function initBabyJub(): Promise<void> {
    if (!babyjubjub) {
        babyjubjub = await buildBabyjub()
    }
}

async function initEddsa(): Promise<void> {
    if (!eddsa) {
        eddsa = await buildEddsa()
    }
}

async function babyJubJubGeneratePrivateKey(): Promise<PrivateKey> {
    await initBabyJub()
    return babyjubjub.F.random()
}

async function babyJubJubGeneratePublicKey(
    privateKey: PrivateKey
): Promise<Point> {
    await initEddsa()
    return eddsa.prv2pub(privateKey)
}

async function babyJubJubSignature(
    msg: Message,
    privateKey: PrivateKey
): Promise<Signature> {
    await initEddsa()
    return eddsa.signPedersen(privateKey, msg)
}

async function packSignature(signature: Signature): Promise<SignatureBuffer> {
    await initEddsa()
    return eddsa.packSignature(signature)
}

async function packPoint(point: Point): Promise<PointBuffer> {
    await initBabyJub()
    return babyjubjub.packPoint(point)
}

export {
    babyJubJubGeneratePrivateKey,
    babyJubJubGeneratePublicKey,
    babyJubJubSignature,
    packSignature,
    packPoint,
    PrivateKey,
    Message,
    Hash,
    Signature,
    SignatureBuffer,
    PointBuffer,
}
