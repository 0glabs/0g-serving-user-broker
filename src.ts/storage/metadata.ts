class Metadata {
    private static isBrowser: boolean =
        typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined'
    private static nodeStorageFilePath: string
    private static nodeStorage: { [key: string]: string }
    private static initialized = false

    static async initialize(customPath?: string) {
        if (this.initialized) {
            return
        }
        if (!this.isBrowser) {
            const path = await import('path')
            const fs = await import('fs')
            this.nodeStorageFilePath = path.join(__dirname, 'nodeStorage.json')
            this.nodeStorage = this.loadNodeStorage(fs.default)
        } else {
            this.nodeStorage = {}
        }
        this.initialized = true
    }

    private static loadNodeStorage(fs: any): { [key: string]: string } {
        if (fs.existsSync(this.nodeStorageFilePath)) {
            const data = fs.readFileSync(this.nodeStorageFilePath, 'utf-8')
            return JSON.parse(data)
        }
        return {}
    }

    private static saveNodeStorage() {
        if (!this.isBrowser) {
            console.log('!isBrowser')
            const fs = require('fs')
            fs.writeFileSync(
                this.nodeStorageFilePath,
                JSON.stringify(this.nodeStorage, null, 2),
                'utf-8'
            )
        }
    }

    private static setItem(key: string, value: string) {
        this.initialize()
        if (this.isBrowser) {
            localStorage.setItem(key, value)
        } else {
            this.nodeStorage[key] = value
            this.saveNodeStorage()
        }
    }

    private static getItem(key: string): string | null {
        this.initialize()
        if (this.isBrowser) {
            return localStorage.getItem(key)
        } else {
            return this.nodeStorage[key] ?? null
        }
    }

    static storeNonce(key: string, value: number) {
        this.setItem(`${key}_nonce`, value.toString())
    }

    static storeOutputFee(key: string, value: number) {
        this.setItem(`${key}_outputFee`, value.toString())
    }

    static storeZKPrivateKey(key: string, value: bigint[]) {
        const bigIntStringArray: string[] = value.map((bi) => bi.toString())
        const bigIntJsonString: string = JSON.stringify(bigIntStringArray)
        this.setItem(`${key}_privateKey`, bigIntJsonString)
    }

    static storeSigningKey(key: string, value: string) {
        this.setItem(`${key}_signingKey`, value)
    }

    static getNonce(key: string): number | null {
        const value = this.getItem(`${key}_nonce`)
        return value ? parseInt(value, 10) : null
    }

    static getOutputFee(key: string): number | null {
        const value = this.getItem(`${key}_outputFee`)
        return value ? parseInt(value, 10) : null
    }

    static getZKPrivateKey(key: string): bigint[] | null {
        const value: string | null = this.getItem(`${key}_privateKey`)
        if (!value) {
            return null
        }
        const bigIntStringArray: string[] = JSON.parse(value)
        return bigIntStringArray.map((str) => BigInt(str))
    }

    static getSigningKey(key: string): string | null {
        const value = this.getItem(`${key}_signingKey`)
        return value ?? null
    }
}

export { Metadata }
