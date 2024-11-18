import { ServiceStructOutput } from '../contract/serving/Serving'

export enum CacheValueTypeEnum {
    Service = 'service',
}

export type CacheValueType = CacheValueTypeEnum.Service

export class Cache {
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

    public async setItem(
        key: string,
        value: any,
        ttl: number,
        type: CacheValueType
    ) {
        await this.initialize()
        const now = new Date()
        const item = {
            type,
            value: Cache.encodeValue(value),
            expiry: now.getTime() + ttl,
        }
        if (this.isBrowser) {
            localStorage.setItem(key, JSON.stringify(item))
        } else {
            this.nodeStorage[key] = JSON.stringify(item)
            await this.saveNodeStorage()
        }
    }

    public async getItem(key: string): Promise<any | null> {
        await this.initialize()
        let itemStr: string | null
        if (this.isBrowser) {
            itemStr = localStorage.getItem(key)
        } else {
            itemStr = this.nodeStorage[key] ?? null
        }
        if (!itemStr) {
            return null
        }
        const item = JSON.parse(itemStr)
        const now = new Date()
        if (now.getTime() > item.expiry) {
            if (this.isBrowser) {
                localStorage.removeItem(key)
            } else {
                delete this.nodeStorage[key]
                await this.saveNodeStorage()
            }
            return null
        }
        return Cache.decodeValue(item.value, item.type)
    }

    private async initialize() {
        console.log('this.initialized:', this.initialized)
        if (this.initialized) {
            return
        }
        if (!this.isBrowser) {
            const fs = await import('fs')
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

    static encodeValue(value: any): string {
        return JSON.stringify(value, (_, val) =>
            typeof val === 'bigint' ? `${val.toString()}n` : val
        )
    }

    static decodeValue(encodedValue: string, type: CacheValueType): any {
        let ret = JSON.parse(encodedValue, (_, val) => {
            if (typeof val === 'string' && /^\d+n$/.test(val)) {
                return BigInt(val.slice(0, -1))
            }
            return val
        })

        if (type === CacheValueTypeEnum.Service) {
            return Cache.createServiceStructOutput(ret)
        }

        return ret
    }

    static createServiceStructOutput(
        fields: [
            string,
            string,
            string,
            string,
            bigint,
            bigint,
            bigint,
            string,
            string
        ]
    ): ServiceStructOutput {
        const tuple: [
            string,
            string,
            string,
            string,
            bigint,
            bigint,
            bigint,
            string,
            string
        ] = fields

        const object = {
            provider: fields[0],
            name: fields[1],
            serviceType: fields[2],
            url: fields[3],
            inputPrice: fields[4],
            outputPrice: fields[5],
            updatedAt: fields[6],
            model: fields[7],
            verifiability: fields[8],
        }

        return Object.assign(tuple, object)
    }
}
