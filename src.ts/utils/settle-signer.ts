import { PackedPrivkey } from '../settle-signer'

export function stringToSettleSignerPrivateKey(str: string): PackedPrivkey {
    const parsed = JSON.parse(str)

    if (!Array.isArray(parsed) || parsed.length !== 2) {
        throw new Error('Invalid input string')
    }

    const [first, second] = parsed.map((value) => {
        if (typeof value === 'string' || typeof value === 'number') {
            return BigInt(value)
        }
        throw new Error('Invalid number format')
    }) as PackedPrivkey

    return [first, second]
}

export function settlePrivateKeyToString(key: PackedPrivkey): string {
    try {
        return JSON.stringify(key.map((v: BigInt) => v.toString()))
    } catch (error) {
        throw error
    }
}
