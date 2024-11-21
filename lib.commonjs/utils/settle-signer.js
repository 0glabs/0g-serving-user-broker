"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringToSettleSignerPrivateKey = stringToSettleSignerPrivateKey;
exports.settlePrivateKeyToString = settlePrivateKeyToString;
function stringToSettleSignerPrivateKey(str) {
    const parsed = JSON.parse(str);
    if (!Array.isArray(parsed) || parsed.length !== 2) {
        throw new Error('Invalid input string');
    }
    const [first, second] = parsed.map((value) => {
        if (typeof value === 'string' || typeof value === 'number') {
            return BigInt(value);
        }
        throw new Error('Invalid number format');
    });
    return [first, second];
}
function settlePrivateKeyToString(key) {
    try {
        return JSON.stringify(key.map((v) => v.toString()));
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=settle-signer.js.map