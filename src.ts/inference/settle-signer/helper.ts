import {
    babyJubJubSignature,
    packSignature,
    SignatureBuffer,
    PrivateKey,
} from './crypto'
import { Request } from './request'

export const FIELD_SIZE = 32

export async function signRequests(
    requests: Request[],
    privateKey: PrivateKey
): Promise<SignatureBuffer[]> {
    const serializedRequestTrace = requests.map((request) =>
        request.serialize()
    )
    const signatures: SignatureBuffer[] = []

    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await babyJubJubSignature(
            serializedRequestTrace[i],
            privateKey
        )
        signatures.push(await packSignature(signature))
    }

    return signatures
}
