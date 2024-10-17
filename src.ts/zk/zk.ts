import { genKeyPair, signData } from 'zk-settlement-base/src/client'
import { Metadata } from '../storage'

export interface ZKRequest {
    fee: number
    nonce: number
    providerAddress: string
    userAddress: string
}

export async function createZKSigningKey(
    providerAddress: string
): Promise<{ privateKey: [bigint, bigint]; publicKey: [bigint, bigint] }> {
    const keyPair = await genKeyPair()
    const privateKey: [bigint, bigint] = [
        keyPair.packPrivkey0,
        keyPair.packPrivkey1,
    ]
    const publicKey: [bigint, bigint] = [
        keyPair.packedPubkey0,
        keyPair.packedPubkey1,
    ]
    Metadata.storePrivateKey(providerAddress, privateKey)
    return { privateKey, publicKey }
}

export async function sign(
    requests: any,
    privateKey: bigint[]
): Promise<string> {
    const signatures = await signData(requests, privateKey)
    return signatures.toString()
}
