"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptData = encryptData;
exports.decryptData = decryptData;
exports.hexToRoots = hexToRoots;
exports.signRequest = signRequest;
exports.eciesDecrypt = eciesDecrypt;
exports.aesGCMDecrypt = aesGCMDecrypt;
const tslib_1 = require("tslib");
const ethers_1 = require("ethers");
const const_1 = require("./const");
const crypto_js_1 = tslib_1.__importDefault(require("crypto-js"));
const eciesjs_1 = require("eciesjs");
const crypto = tslib_1.__importStar(require("crypto"));
const ivLength = 12;
const tagLength = 16;
const sigLength = 65;
// Inference
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
// Fine-tuning
function hexToRoots(hexString) {
    if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2);
    }
    return Buffer.from(hexString, 'hex').toString('utf8');
}
async function signRequest(signer, userAddress, nonce, datasetRootHash, fee) {
    const hash = ethers_1.ethers.solidityPackedKeccak256(['address', 'uint256', 'string', 'uint256'], [userAddress, nonce, datasetRootHash, fee]);
    return await signer.signMessage(ethers_1.ethers.toBeArray(hash));
}
async function eciesDecrypt(signer, encryptedData) {
    encryptedData = encryptedData.startsWith('0x')
        ? encryptedData.slice(2)
        : encryptedData;
    const privateKey = eciesjs_1.PrivateKey.fromHex(signer.privateKey);
    const data = Buffer.from(encryptedData, 'hex');
    const decrypted = (0, eciesjs_1.decrypt)(privateKey.secret, data);
    return decrypted.toString('hex');
}
async function aesGCMDecrypt(key, data, providerSigner) {
    const iv = data.subarray(0, ivLength);
    const encryptedText = data.subarray(ivLength, data.length - tagLength - sigLength);
    const authTag = data.subarray(data.length - tagLength - sigLength, data.length - sigLength);
    const tagSig = data.subarray(data.length - sigLength, data.length);
    const recoveredAddress = ethers_1.ethers.recoverAddress(ethers_1.ethers.keccak256(authTag), '0x' + tagSig.toString('hex'));
    if (recoveredAddress.toLowerCase() !== providerSigner.toLowerCase()) {
        throw new Error('Invalid tag signature');
    }
    const privateKey = Buffer.from(key, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', privateKey, iv);
    decipher.setAuthTag(authTag);
    let decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
    ]);
    return decrypted;
}
//# sourceMappingURL=encrypt.js.map