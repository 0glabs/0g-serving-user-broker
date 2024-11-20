import {
    babyJubJubGeneratePrivateKey,
    babyJubJubGeneratePublicKey,
    packPoint,
    unpackPoint,
    SignatureBuffer,
} from './crypto'
import { bytesToBigint, bigintToBytes } from './utils'
import { signRequests, verifySig, FIELD_SIZE } from './helper'
import { Request } from './request'

const BIGINT_SIZE = 16
export type DoublePackedPubkey = [bigint, bigint]
export type PackedPrivkey = [bigint, bigint]
export type KeyPair = {
    packedPrivkey: PackedPrivkey
    doublePackedPubkey: DoublePackedPubkey
}

export async function genKeyPair(): Promise<KeyPair> {
    // generate private key
    const privkey = await babyJubJubGeneratePrivateKey()
    // generate public key
    const pubkey = await babyJubJubGeneratePublicKey(privkey)
    // pack public key to FIELD_SIZE bytes
    const packedPubkey = await packPoint(pubkey)
    // unpack packed pubkey to bigint
    const packedPubkey0 = bytesToBigint(packedPubkey.slice(0, BIGINT_SIZE))
    const packedPubkey1 = bytesToBigint(packedPubkey.slice(BIGINT_SIZE))
    // unpack private key to bigint
    const packPrivkey0 = bytesToBigint(privkey.slice(0, BIGINT_SIZE))
    const packPrivkey1 = bytesToBigint(privkey.slice(BIGINT_SIZE))

    return {
        packedPrivkey: [packPrivkey0, packPrivkey1],
        doublePackedPubkey: [packedPubkey0, packedPubkey1],
    }
}

export async function signData(
    data: Request[],
    packedPrivkey: PackedPrivkey
): Promise<SignatureBuffer[]> {
    // unpack private key to bytes
    const packedPrivkey0 = bigintToBytes(packedPrivkey[0], BIGINT_SIZE)
    const packedPrivkey1 = bigintToBytes(packedPrivkey[1], BIGINT_SIZE)

    // combine bytes to Uint8Array
    const privateKey = new Uint8Array(FIELD_SIZE)
    privateKey.set(packedPrivkey0, 0)
    privateKey.set(packedPrivkey1, BIGINT_SIZE)

    // sign data
    const signatures = await signRequests(data, privateKey)
    return signatures
}

export async function verifySignature(
    data: Request[],
    signatures: Uint8Array[],
    doublePackedPubkey: DoublePackedPubkey
): Promise<boolean[]> {
    // unpack packed pubkey to FIELD_SIZE bytes
    const packedPubkey0 = bigintToBytes(doublePackedPubkey[0], BIGINT_SIZE)
    const packedPubkey1 = bigintToBytes(doublePackedPubkey[1], BIGINT_SIZE)

    // combine bytes to Uint8Array
    const packedPubkey = new Uint8Array(FIELD_SIZE)
    packedPubkey.set(packedPubkey0, 0)
    packedPubkey.set(packedPubkey1, BIGINT_SIZE)

    // unpack packed pubkey to point
    const pubkey = await unpackPoint(packedPubkey)

    // verify signature
    const isValid = await verifySig(data, signatures, pubkey)
    return isValid
}
