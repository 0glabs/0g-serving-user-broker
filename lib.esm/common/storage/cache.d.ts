import { ServiceStructOutput as InferenceServiceStructOutput } from '../../inference/contract';
export declare enum CacheValueTypeEnum {
    Service = "service",
    BigInt = "bigint",
    Other = "other"
}
export type CacheValueType = CacheValueTypeEnum.Service | CacheValueTypeEnum.BigInt | CacheValueTypeEnum.Other;
export declare class Cache {
    private nodeStorage;
    private initialized;
    constructor();
    setItem(key: string, value: any, ttl: number, type: CacheValueType): Promise<void>;
    getItem(key: string): Promise<any | null>;
    private initialize;
    static encodeValue(value: any): string;
    static decodeValue(encodedValue: string, type: CacheValueType): any;
    static createServiceStructOutput(fields: [string, string, string, bigint, bigint, bigint, string, string]): InferenceServiceStructOutput;
}
//# sourceMappingURL=cache.d.ts.map