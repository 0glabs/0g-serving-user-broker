"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bigintToBytes = bigintToBytes;
exports.bytesToBigint = bytesToBigint;
exports.convertToBiguint64 = convertToBiguint64;
exports.formatArray = formatArray;
exports.jsonifyData = jsonifyData;
function bigintToBytes(bigint, length) {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = Number((bigint >> BigInt(8 * i)) & BigInt(0xff));
    }
    return bytes;
}
function bytesToBigint(bytes) {
    let bigint = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
        bigint += BigInt(bytes[i]) << BigInt(8 * i);
    }
    return bigint;
}
function convertToBiguint64(timestamp) {
    const bytes = new ArrayBuffer(8);
    const view = new DataView(bytes);
    view.setBigUint64(0, BigInt(timestamp), true); // 8字节，无符号整型，小端序
    return view.getBigUint64(0, true);
}
function formatArray(arr) {
    return `[${arr.join(", ")}]`;
}
function jsonifyData(data, useBigInt = false) {
    function transform(item) {
        if (item instanceof Uint8Array) {
            if (useBigInt) {
                // 将 Uint8Array 的每个元素转换为 BigInt 字符串
                return Array.from(item, (byte) => BigInt(byte).toString());
            }
            else {
                // 直接转换为普通数组
                return Array.from(item);
            }
        }
        else if (Array.isArray(item)) {
            return item.map(transform);
        }
        else if (typeof item === "object" && item !== null) {
            return Object.fromEntries(Object.entries(item).map(([key, value]) => [key, transform(value)]));
        }
        return item;
    }
    return JSON.stringify(transform(data));
}
//# sourceMappingURL=utils.js.map