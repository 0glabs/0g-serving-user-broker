import { InferenceServiceStruct, FineTuneServiceStruct, QuotaStructOutput } from '../contract'
import { QuotaStruct } from '../contract/finetune/FineTuneServing'

export enum CacheValueTypeEnum {
    InferenceService = 'inference',
    FineTuneService = 'fine-tune',
}

export class Cache {
    private nodeStorage: { [key: string]: string } = {}
    private initialized = false

    constructor() {}

    public async setItem(
        key: string,
        value: any,
        ttl: number,
        type: CacheValueTypeEnum
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

    // todo: special process with quota?
    static encodeValue(value: any): string {
        return JSON.stringify(value, (_, val) =>
            typeof val === 'bigint' ? `${val.toString()}n` : val
        )
    }

    static decodeValue(encodedValue: string, type: CacheValueTypeEnum): any {
        let ret = JSON.parse(encodedValue, (_, val) => {
            if (typeof val === 'string' && /^\d+n$/.test(val)) {
                return BigInt(val.slice(0, -1))
            }
            return val
        })

        switch (type) {
            case CacheValueTypeEnum.InferenceService:
                return Cache.createInferenceServiceStruct(ret)
            case CacheValueTypeEnum.FineTuneService:
                return Cache.createFineTuneServiceStruct(ret)
        }
        return ret
    }

    static createInferenceServiceStruct(
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
    ): InferenceServiceStruct {
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

    static createQuotaServiceStructOutput(
        fields : [
            bigint,
            bigint,
            bigint,
            bigint,
            string,
        ]
    ) : QuotaStructOutput {
        const tuple : [
            bigint,
            bigint,
            bigint,
            bigint,
            string,
        ] = fields

        const object = {
            cpuCount : fields[0],
            nodeMemory : fields[1],
            gpuCount : fields[2],
            nodeStorage : fields[3],
            gpuType : fields[4],
        }

        return Object.assign(tuple, object)
    }

    static createFineTuneServiceStruct(
        fields: [
            // provider
            string,
            // name
            string,
            // url
            string,
            // quote
            bigint,
            bigint,
            bigint,
            bigint,
            string,
            // price per token
            bigint,
            // occupied
            boolean
        ]
    ): FineTuneServiceStruct {
        const q = this.createQuotaServiceStructOutput([
            fields[3],
            fields[4],
            fields[5],
            fields[6],
            fields[7],
        ])
        const tuple: [
            // provider
            string,
            // name
            string,
            // url
            string,
            QuotaStructOutput,
            // quote
            // bigint,
            // bigint,
            // bigint,
            // bigint,
            // string,
            // price per token
            bigint,
            // occupied
            boolean
        ] = [
           fields[0] ,
            fields[1] ,
            fields[2] ,
            q,
            fields[8],
            fields[9]
        ]
        //
        // const quota_object = {
        //     quota_cpuCount: fields[3],
        //     quota_nodeMemory: fields[4],
        //     quota_gpuCount: fields[5],
        //     quota_nodeStorage: fields[6],
        //     quota_gpuType: fields[7],
        // }
        // const quota = Object.assign(tuple, quota_object)

        const object = {
            provider: fields[0],
            name: fields[1],
            url: fields[2],
            quota : q,
            pricePerToken: fields[8],
            occupied : fields[9]
        }
        return Object.assign(tuple, object)
    }
}
