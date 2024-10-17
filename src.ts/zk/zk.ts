// import { signData, getSignKeyPair } from '0g-zksettlement/server/client'

export interface ZKRequest {
    fee: number
    nonce: number
    providerAddress: string
    userAddress: string
}

export async function createKey(): Promise<bigint[]> {
    const privateKey = Math.floor(Math.random() * 10000)
    return new Promise((resolve, reject) => {
        return resolve([BigInt(privateKey)])
    })
    // const keyPair = await getSignKeyPair()
    // return keyPair.privkey as bigint[]
}

export async function sign(
    requests: any,
    privateKey: bigint[]
): Promise<string> {
    return new Promise((resolve, reject) => {
        return resolve(privateKey.toString())
    })
    // const signatures = await signData(requests, privateKey)
    // return signatures.toString()
}
