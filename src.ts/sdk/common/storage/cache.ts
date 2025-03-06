import { ServiceStructOutput as InferenceServiceStructOutput } from '../../inference/contract'

export enum CacheValueTypeEnum {
    Service = 'service',
    BigInt = 'bigint',
    Other = 'other',
}

export type CacheValueType =
    | CacheValueTypeEnum.Service
    | CacheValueTypeEnum.BigInt
    | CacheValueTypeEnum.Other

export class Cache {
    private nodeStorage: { [key: string]: string } = {}
    private initialized = false

    constructor() {}

    public setLock(
        key: string,
        value: string,
        ttl: number,
        type: CacheValueType
    ): boolean {
        this.initialize()
        if (this.nodeStorage[key]) {
            return false
        }
        this.setItem(key, value, ttl, type)
        return true
    }

    public removeLock(key: string): void {
        this.initialize()
        delete this.nodeStorage[key]
    }

    public setItem(key: string, value: any, ttl: number, type: CacheValueType) {
        this.initialize()
        const now = new Date()
        const item = {
            type,
            value: Cache.encodeValue(value),
            expiry: now.getTime() + ttl,
        }
        this.nodeStorage[key] = JSON.stringify(item)
    }

    public getItem(key: string): any | null {
        this.initialize()
        const itemStr = this.nodeStorage[key] ?? null
        if (!itemStr) {
            return null
        }
        const item = JSON.parse(itemStr)
        const now = new Date()
        if (now.getTime() > item.expiry) {
            delete this.nodeStorage[key]
            return null
        }
        return Cache.decodeValue(item.value, item.type)
    }

    private initialize() {
        if (this.initialized) {
            return
        }
        this.nodeStorage = {}
        this.initialized = true
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
        fields: [string, string, string, bigint, bigint, bigint, string, string]
    ): InferenceServiceStructOutput {
        const tuple: [
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
            serviceType: fields[1],
            url: fields[2],
            inputPrice: fields[3],
            outputPrice: fields[4],
            updatedAt: fields[5],
            model: fields[6],
            verifiability: fields[7],
        }

        return Object.assign(tuple, object)
    }
}
