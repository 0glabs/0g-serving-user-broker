import { ServiceStructOutput } from '../contract/serving/Serving';
export declare enum CacheValueTypeEnum {
    Service = "service"
}
export type CacheValueType = CacheValueTypeEnum.Service;
export declare class Cache {
    private isBrowser;
    private nodeStorageFilePath;
    private nodeStorage;
    private initialized;
    private customPath;
    constructor(customPath: string);
    setItem(key: string, value: any, ttl: number, type: CacheValueType): Promise<void>;
    getItem(key: string): Promise<any | null>;
    private initialize;
    private loadNodeStorage;
    private saveNodeStorage;
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