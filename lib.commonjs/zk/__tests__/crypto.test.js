"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const crypto_1 = require("../crypto");
(0, vitest_1.describe)('Crypto Operations', () => {
    let privateKey;
    let publicKey; // Point type from circomlibjs
    let message;
    let signature; // Signature type from circomlibjs
    (0, vitest_1.beforeAll)(async () => {
        // 初始化测试数据
        privateKey = await (0, crypto_1.babyJubJubGeneratePrivateKey)();
        publicKey = await (0, crypto_1.babyJubJubGeneratePublicKey)(privateKey);
        message = new Uint8Array([1, 2, 3, 4, 5]);
    });
    (0, vitest_1.it)('should generate valid private key', async () => {
        const key = await (0, crypto_1.babyJubJubGeneratePrivateKey)();
        (0, vitest_1.expect)(key).toBeInstanceOf(Uint8Array);
        (0, vitest_1.expect)(key.length).toBeGreaterThan(0);
    });
    (0, vitest_1.it)('should generate public key from private key', async () => {
        const pubKey = await (0, crypto_1.babyJubJubGeneratePublicKey)(privateKey);
        (0, vitest_1.expect)(Array.isArray(pubKey)).toBe(true);
        (0, vitest_1.expect)(pubKey).toHaveLength(2);
    });
    (0, vitest_1.it)('should sign message and verify signature', async () => {
        // 签名消息
        signature = await (0, crypto_1.babyJubJubSignature)(message, privateKey);
        (0, vitest_1.expect)(signature).toBeDefined();
        (0, vitest_1.expect)(signature.R8).toBeDefined();
        (0, vitest_1.expect)(signature.S).toBeDefined();
        // 验证签名
        const isValid = await (0, crypto_1.babyJubJubVerify)(message, signature, publicKey);
        (0, vitest_1.expect)(isValid).toBe(true);
    });
    (0, vitest_1.it)('should pack and unpack signature correctly', async () => {
        const sig = await (0, crypto_1.babyJubJubSignature)(message, privateKey);
        const packed = await (0, crypto_1.packSignature)(sig);
        const unpacked = await (0, crypto_1.unpackSignature)(packed);
        (0, vitest_1.expect)(unpacked.R8[0].toString()).toBe(sig.R8[0].toString());
        (0, vitest_1.expect)(unpacked.R8[1].toString()).toBe(sig.R8[1].toString());
        (0, vitest_1.expect)(unpacked.S.toString()).toBe(sig.S.toString());
    });
    (0, vitest_1.it)('should pack and unpack point correctly', async () => {
        const packed = await (0, crypto_1.packPoint)(publicKey);
        const unpacked = await (0, crypto_1.unpackPoint)(packed);
        (0, vitest_1.expect)(unpacked[0].toString()).toBe(publicKey[0].toString());
        (0, vitest_1.expect)(unpacked[1].toString()).toBe(publicKey[1].toString());
    });
    (0, vitest_1.it)('should generate hash', async () => {
        const hashed = await (0, crypto_1.hash)(message);
        (0, vitest_1.expect)(hashed).toBeInstanceOf(Uint8Array);
    });
    (0, vitest_1.it)('should fail verification with wrong message', async () => {
        const wrongMessage = new Uint8Array([9, 9, 9]);
        const isValid = await (0, crypto_1.babyJubJubVerify)(wrongMessage, signature, publicKey);
        (0, vitest_1.expect)(isValid).toBe(false);
    });
});
//# sourceMappingURL=crypto.test.js.map