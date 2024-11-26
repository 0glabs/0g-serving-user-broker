export class Metadata {
    private nodeStorage: { [key: string]: string } = {}
    private initialized = false

    constructor() {}

    async initialize() {
        if (this.initialized) {
            return
        }
        this.nodeStorage = {}
        this.initialized = true
    }

    private async setItem(key: string, value: string) {
        await this.initialize()
        this.nodeStorage[key] = value
    }

    private async getItem(key: string): Promise<string | null> {
        await this.initialize()
        return this.nodeStorage[key] ?? null
    }

    async storeNonce(key: string, value: number) {
        await this.setItem(`${key}_nonce`, value.toString())
    }

    async storeSettleSignerPrivateKey(key: string, value: bigint[]) {
        const bigIntStringArray: string[] = value.map((bi) => bi.toString())
        const bigIntJsonString: string = JSON.stringify(bigIntStringArray)
        await this.setItem(`${key}_settleSignerPrivateKey`, bigIntJsonString)
    }

    async storeSigningKey(key: string, value: string) {
        await this.setItem(`${key}_signingKey`, value)
    }

    async getNonce(key: string): Promise<number | null> {
        const value = await this.getItem(`${key}_nonce`)
        return value ? parseInt(value, 10) : null
    }

    async getSettleSignerPrivateKey(key: string): Promise<bigint[] | null> {
        const value: string | null = await this.getItem(
            `${key}_settleSignerPrivateKey`
        )
        if (!value) {
            return null
        }
        const bigIntStringArray: string[] = JSON.parse(value)
        return bigIntStringArray.map((str) => BigInt(str))
    }

    async getSigningKey(key: string): Promise<string | null> {
        const value = await this.getItem(`${key}_signingKey`)
        return value ?? null
    }
}
