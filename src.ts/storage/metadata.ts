export class Metadata {
    private isBrowser: boolean =
        typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined'
    private nodeStorageFilePath: string = ''
    private nodeStorage: { [key: string]: string } = {}
    private initialized = false
    private customPath: string

    constructor(customPath: string) {
        this.customPath = customPath
    }

    async initialize() {
        if (this.initialized) {
            return
        }
        if (!this.isBrowser) {
            // const path = await import('path')
            const fs = await import('fs')
            // this.nodeStorageFilePath = path.join(this.customPath, 'nodeStorage.json')
            this.nodeStorageFilePath = this.customPath
            this.nodeStorage = this.loadNodeStorage(fs)
        } else {
            this.nodeStorage = {}
        }
        this.initialized = true
    }

    private loadNodeStorage(fs: any): { [key: string]: string } {
        if (fs.existsSync(this.nodeStorageFilePath)) {
            const data = fs.readFileSync(this.nodeStorageFilePath, 'utf-8')
            if (!data) {
                return {}
            }
            return JSON.parse(data)
        }
        return {}
    }

    private async saveNodeStorage() {
        if (!this.isBrowser) {
            const fs = await import('fs')
            fs.writeFileSync(
                this.nodeStorageFilePath,
                JSON.stringify(this.nodeStorage, null, 2),
                'utf-8'
            )
        }
    }

    private async setItem(key: string, value: string) {
        await this.initialize()
        if (this.isBrowser) {
            localStorage.setItem(key, value)
        } else {
            this.nodeStorage[key] = value
            await this.saveNodeStorage()
        }
    }

    private async getItem(key: string): Promise<string | null> {
        await this.initialize()
        if (this.isBrowser) {
            return localStorage.getItem(key)
        } else {
            return this.nodeStorage[key] ?? null
        }
    }

    async storeNonce(key: string, value: number) {
        await this.setItem(`${key}_nonce`, value.toString())
    }

    async storeOutputFee(key: string, value: number) {
        await this.setItem(`${key}_outputFee`, value.toString())
    }

    async storeZKPrivateKey(key: string, value: bigint[]) {
        const bigIntStringArray: string[] = value.map((bi) => bi.toString())
        const bigIntJsonString: string = JSON.stringify(bigIntStringArray)
        await this.setItem(`${key}_zkPrivateKey`, bigIntJsonString)
    }

    async storeSigningKey(key: string, value: string) {
        await this.setItem(`${key}_signingKey`, value)
    }

    async getNonce(key: string): Promise<number | null> {
        const value = await this.getItem(`${key}_nonce`)
        return value ? parseInt(value, 10) : null
    }

    async getOutputFee(key: string): Promise<number | null> {
        const value = await this.getItem(`${key}_outputFee`)
        return value ? parseInt(value, 10) : null
    }

    async getZKPrivateKey(key: string): Promise<bigint[] | null> {
        const value: string | null = await this.getItem(`${key}_zkPrivateKey`)
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
