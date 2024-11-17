// import { signData, genKeyPair } from '0g-zk-settlement-client'

export interface ZKRequest {
    fee: string
    nonce: string
    providerAddress: string
    userAddress: string
}

export async function createKey(): Promise<
    [[bigint, bigint], [bigint, bigint]]
> {
    let keyPair: {
        packPrivkey0: bigint
        packPrivkey1: bigint
        packedPubkey0: bigint
        packedPubkey1: bigint
    }
    try {
        keyPair = {
            packPrivkey0: BigInt('123123'),
            packPrivkey1: BigInt('123123'),
            packedPubkey0: BigInt('123123'),
            packedPubkey1: BigInt('123123'),
        }
        // keyPair = await genKeyPair()
        return [
            [keyPair.packPrivkey0, keyPair.packPrivkey1],
            [keyPair.packedPubkey0, keyPair.packedPubkey1],
        ]
    } catch (error) {
        console.error('Create ZK key error', error)
        throw error
    }
}

export async function sign(
    requests: any,
    privateKey: bigint[]
): Promise<string> {
    try {
        // signatures = await signData(requests, privateKey)
        // const jsonString = JSON.stringify(Array.from(signatures[0]))
        // return jsonString
        return '123123'
    } catch (error) {
        throw error
    }
}
