export declare const BYTE_SIZE = 8;
export declare function bigintToBytes(bigint: bigint, length: number): Uint8Array;
export declare function bytesToBigint(bytes: Uint8Array): bigint;
export declare function convertToBiguint64(timestamp: number | bigint): bigint;
export declare function formatArray(arr: Array<unknown>): string;
type JsonValue = string | number | boolean | null | JsonValue[] | {
    [key: string]: JsonValue;
};
type TransformableData = Uint8Array | Array<TransformableData> | {
    [key: string]: TransformableData;
} | JsonValue;
export declare function jsonifyData(data: TransformableData, useBigInt?: boolean): string;
export {};
//# sourceMappingURL=utils.d.ts.map