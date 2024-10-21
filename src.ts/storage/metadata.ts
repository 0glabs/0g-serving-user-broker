export class Metadata {
    static storeNonce(key: string, value: number) {
        localStorage.setItem(`${key}_nonce`, value.toString())
    }

    static storeOutputFee(key: string, value: number) {
        localStorage.setItem(`${key}_outputFee`, value.toString())
    }

    static storeZKPrivateKey(key: string, value: bigint[]) {
        const bigIntStringArray: string[] = value.map((bi) => bi.toString())
        const bigIntJsonString: string = JSON.stringify(bigIntStringArray)
        localStorage.setItem(`${key}_privateKey`, bigIntJsonString)
    }

    static storeSigningKey(key: string, value: string) {
        localStorage.setItem(`${key}_signingKey`, value)
    }

    static getNonce(key: string): number | null {
        const value = localStorage.getItem(`${key}_nonce`)
        return value ? parseInt(value, 10) : null
    }

    static getOutputFee(key: string): number | null {
        const value = localStorage.getItem(`${key}_outputFee`)
        return value ? parseInt(value, 10) : null
    }

    static getZKPrivateKey(key: string): bigint[] | null {
        const value: string | null = localStorage.getItem(`${key}_privateKey`)
        if (!value) {
            return null
        }
        const bigIntStringArray: string[] = JSON.parse(value)
        return bigIntStringArray.map((str) => BigInt(str))
    }

    static getSigningKey(key: string): string | null {
        const value = localStorage.getItem(`${key}_signingKey`)
        return value ?? null
    }
}
