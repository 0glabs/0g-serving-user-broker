"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.genKeyPair = genKeyPair;
exports.signData = signData;
const crypto_1 = require("./crypto");
const utils_1 = require("./utils");
const helper_1 = require("./helper");
const BIGINT_SIZE = 16;
async function genKeyPair() {
    // generate private key
    const privkey = await (0, crypto_1.babyJubJubGeneratePrivateKey)();
    // generate public key
    const pubkey = await (0, crypto_1.babyJubJubGeneratePublicKey)(privkey);
    // pack public key to FIELD_SIZE bytes
    const packedPubkey = await (0, crypto_1.packPoint)(pubkey);
    // unpack packed pubkey to bigint
    const packedPubkey0 = (0, utils_1.bytesToBigint)(packedPubkey.slice(0, BIGINT_SIZE));
    const packedPubkey1 = (0, utils_1.bytesToBigint)(packedPubkey.slice(BIGINT_SIZE));
    // unpack private key to bigint
    const packPrivkey0 = (0, utils_1.bytesToBigint)(privkey.slice(0, BIGINT_SIZE));
    const packPrivkey1 = (0, utils_1.bytesToBigint)(privkey.slice(BIGINT_SIZE));
    return {
        packedPrivkey: [packPrivkey0, packPrivkey1],
        doublePackedPubkey: [packedPubkey0, packedPubkey1],
    };
}
async function signData(data, packedPrivkey) {
    // unpack private key to bytes
    const packedPrivkey0 = (0, utils_1.bigintToBytes)(packedPrivkey[0], BIGINT_SIZE);
    const packedPrivkey1 = (0, utils_1.bigintToBytes)(packedPrivkey[1], BIGINT_SIZE);
    // combine bytes to Uint8Array
    const privateKey = new Uint8Array(helper_1.FIELD_SIZE);
    privateKey.set(packedPrivkey0, 0);
    privateKey.set(packedPrivkey1, BIGINT_SIZE);
    // sign data
    const signatures = await (0, helper_1.signRequests)(data, privateKey);
    return signatures;
}
//# sourceMappingURL=settle-signer.js.map