import { ServiceStructOutput } from '../contract/serving/Serving'

export enum CacheValueTypeEnum {
    Service = 'service',
}

export type CacheValueType = CacheValueTypeEnum.Service

export class Cache {
    static setItem(key: string, value: any, ttl: number, type: CacheValueType) {
        const now = new Date()

        const item = {
            type,
            value: Cache.encodeValue(value),
            expiry: now.getTime() + ttl,
        }

        localStorage.setItem(key, JSON.stringify(item))
    }

    static getItem(key: string) {
        const itemStr = localStorage.getItem(key)

        if (!itemStr) {
            return null
        }

        const item = JSON.parse(itemStr)
        const now = new Date()

        if (now.getTime() > item.expiry) {
            localStorage.removeItem(key)
            return null
        }

        return Cache.decodeValue(item.value, item.type)
    }

    static removeItem(key: string) {
        localStorage.removeItem(key)
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
