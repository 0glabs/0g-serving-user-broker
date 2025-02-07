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
        this.nodeStorage[key] = JSON.stringify(item)
    }

    public async getItem(key: string): Promise<any | null> {
        await this.initialize()
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

    private async initialize() {
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
