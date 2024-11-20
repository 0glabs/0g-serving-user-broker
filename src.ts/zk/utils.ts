export const BYTE_SIZE = 8;

export function bigintToBytes(bigint: bigint, length: number): Uint8Array {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = Number((bigint >> BigInt(BYTE_SIZE * i)) & BigInt(0xff));
    }
    return bytes;
}

export function bytesToBigint(bytes: Uint8Array): bigint {
    let bigint = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
        bigint += BigInt(bytes[i]) << BigInt(BYTE_SIZE * i);
    }
    return bigint;
}

export function convertToBiguint64(timestamp: number | bigint): bigint {
    const bytes = new ArrayBuffer(BYTE_SIZE);
    const view = new DataView(bytes);
    view.setBigUint64(0, BigInt(timestamp), true); // 8 bytes, unsigned integer, little endian
    return view.getBigUint64(0, true);
}

export function formatArray(arr: Array<unknown>): string {
    return `[${arr.join(", ")}]`;
}

type JsonValue = 
    | string
    | number
    | boolean
    | null
    | JsonValue[]
    | { [key: string]: JsonValue };

type TransformableData = 
    | Uint8Array
    | Array<TransformableData>
    | { [key: string]: TransformableData }
    | JsonValue;

export function jsonifyData(data: TransformableData, useBigInt = false): string {
    function transform(item: TransformableData): JsonValue {
        if (item instanceof Uint8Array) {
            if (useBigInt) {
                // convert each element of Uint8Array to BigInt string
                return Array.from(item, (byte) => BigInt(byte).toString());
            } else {
                // convert to normal array
                return Array.from(item);
            }
        } else if (Array.isArray(item)) {
            return item.map(transform);
        } else if (typeof item === "object" && item !== null) {
            return Object.fromEntries(
                Object.entries(item).map(([key, value]) => [key, transform(value as TransformableData)])
            );
        }
        return item as JsonValue;
    }
    return JSON.stringify(transform(data));
}