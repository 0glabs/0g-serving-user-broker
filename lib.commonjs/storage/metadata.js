"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = void 0;
class Metadata {
    static storeNonce(key, value) {
        localStorage.setItem(`${key}_nonce`, value.toString());
    }
    static storeOutputFee(key, value) {
        localStorage.setItem(`${key}_outputFee`, value.toString());
    }
    static storeZKPrivateKey(key, value) {
        const bigIntStringArray = value.map((bi) => bi.toString());
        const bigIntJsonString = JSON.stringify(bigIntStringArray);
        localStorage.setItem(`${key}_privateKey`, bigIntJsonString);
    }
    static storeSigningKey(key, value) {
        localStorage.setItem(`${key}_signingKey`, value);
    }
    static getNonce(key) {
        const value = localStorage.getItem(`${key}_nonce`);
        return value ? parseInt(value, 10) : null;
    }
    static getOutputFee(key) {
        const value = localStorage.getItem(`${key}_outputFee`);
        return value ? parseInt(value, 10) : null;
    }
    static getZKPrivateKey(key) {
        const value = localStorage.getItem(`${key}_privateKey`);
        if (!value) {
            return null;
        }
        const bigIntStringArray = JSON.parse(value);
        return bigIntStringArray.map((str) => BigInt(str));
    }
    static getSigningKey(key) {
        const value = localStorage.getItem(`${key}_signingKey`);
        return value ?? null;
    }
}
exports.Metadata = Metadata;
//# sourceMappingURL=metadata.js.map