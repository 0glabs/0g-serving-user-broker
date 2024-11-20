"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const crypto_1 = require("../crypto");
describe('Crypto Operations', function () {
    // max timeout 10s
    this.timeout(10000);
    let privateKey, publicKey, message, signature;
    (0, mocha_1.before)(async () => {
        // generate private keys
        privateKey = await (0, crypto_1.babyJubJubGeneratePrivateKey)();
        // generate public key
        publicKey = await (0, crypto_1.babyJubJubGeneratePublicKey)(privateKey);
        // generate message
        message = new Uint8Array([1, 2, 3, 4, 5]);
    });
    it('should generate private key', async () => {
        const key = await (0, crypto_1.babyJubJubGeneratePrivateKey)();
        (0, chai_1.expect)(key).to.exist;
    });
    it('should generate public key from private key', async () => {
        const pubKey = await (0, crypto_1.babyJubJubGeneratePublicKey)(privateKey);
        (0, chai_1.expect)(pubKey).to.exist;
        (0, chai_1.expect)(Array.isArray(pubKey)).to.be.true;
    });
    it('should sign and verify message', async () => {
        signature = await (0, crypto_1.babyJubJubSignature)(message, privateKey);
        const isValid = await (0, crypto_1.babyJubJubVerify)(message, signature, publicKey);
        (0, chai_1.expect)(isValid).to.be.true;
    });
    it('should pack and unpack signature', async () => {
        const packedSig = await (0, crypto_1.packSignature)(signature);
        const unpackedSig = await (0, crypto_1.unpackSignature)(packedSig);
        (0, chai_1.expect)(unpackedSig).to.deep.equal(signature);
    });
    it('should pack and unpack point', async () => {
        const packedPoint = await (0, crypto_1.packPoint)(publicKey);
        const unpackedPoint = await (0, crypto_1.unpackPoint)(packedPoint);
        (0, chai_1.expect)(unpackedPoint).to.deep.equal(publicKey);
    });
    it('should generate hash', async () => {
        const hashed = await (0, crypto_1.hash)(message);
        (0, chai_1.expect)(hashed).to.exist;
        (0, chai_1.expect)(hashed instanceof Uint8Array).to.be.true;
    });
});
//# sourceMappingURL=crypto.test.js.map