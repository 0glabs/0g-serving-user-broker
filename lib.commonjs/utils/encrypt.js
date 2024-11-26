"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = encryptData;
exports.decryptData = decryptData;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const const_1 = require("../const");
const crypto_js_1 = tslib_1.__importDefault(require("crypto-js"));
async function deriveEncryptionKey(signer) {
    const signature = await signer.signMessage(const_1.MESSAGE_FOR_ENCRYPTION_KEY);
    const hash = ethers_1.ethers.sha256(ethers_1.ethers.toUtf8Bytes(signature));
    return hash;
}
async function encryptData(signer, data) {
    const key = await deriveEncryptionKey(signer);
    const encrypted = crypto_js_1.default.AES.encrypt(data, key).toString();
    return encrypted;
}
async function decryptData(signer, encryptedData) {
    const key = await deriveEncryptionKey(signer);
    const bytes = crypto_js_1.default.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(crypto_js_1.default.enc.Utf8);
    return decrypted;
}
//# sourceMappingURL=encrypt.js.map