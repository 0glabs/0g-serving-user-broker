"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BYTE_SIZE = void 0;
exports.bigintToBytes = bigintToBytes;
exports.bytesToBigint = bytesToBigint;
exports.convertToBiguint64 = convertToBiguint64;
exports.formatArray = formatArray;
exports.jsonifyData = jsonifyData;
exports.BYTE_SIZE = 8;
function bigintToBytes(bigint, length) {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = Number((bigint >> BigInt(exports.BYTE_SIZE * i)) & BigInt(0xff));
    }
    return bytes;
}
function bytesToBigint(bytes) {
    let bigint = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
        bigint += BigInt(bytes[i]) << BigInt(exports.BYTE_SIZE * i);
    }
    return bigint;
}
function convertToBiguint64(timestamp) {
    const bytes = new ArrayBuffer(exports.BYTE_SIZE);
    const view = new DataView(bytes);
    view.setBigUint64(0, BigInt(timestamp), true); // 8 bytes, unsigned integer, little endian
    return view.getBigUint64(0, true);
}
function formatArray(arr) {
    return `[${arr.join(', ')}]`;
}
function jsonifyData(data, useBigInt = false) {
    function transform(item) {
        if (item instanceof Uint8Array) {
            if (useBigInt) {
                // convert each element of Uint8Array to BigInt string
                return Array.from(item, (byte) => BigInt(byte).toString());
            }
            else {
                // convert to normal array
                return Array.from(item);
            }
        }
        else if (Array.isArray(item)) {
            return item.map(transform);
        }
        else if (typeof item === 'object' && item !== null) {
            return Object.fromEntries(Object.entries(item).map(([key, value]) => [
                key,
                transform(value),
            ]));
        }
        return item;
    }
    return JSON.stringify(transform(data));
}
//# sourceMappingURL=utils.js.map