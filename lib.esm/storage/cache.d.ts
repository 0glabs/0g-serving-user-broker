import { ServiceStructOutput } from '../contract/serving/Serving';
export declare enum CacheValueTypeEnum {
    Service = "service"
}
export type CacheValueType = CacheValueTypeEnum.Service;
export declare class Cache {
    static setItem(key: string, value: any, ttl: number, type: CacheValueType): void;
    static getItem(key: string): any;
    static removeItem(key: string): void;
    static encodeValue(value: any): string;
    static decodeValue(encodedValue: string, type: CacheValueType): any;
    static createServiceStructOutput(fields: [
        string,
        string,
        string,
        string,
        bigint,
        bigint,
        bigint,
        string,
        string
    ]): ServiceStructOutput;
}
//# sourceMappingURL=cache.d.ts.map