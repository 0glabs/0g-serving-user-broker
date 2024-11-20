"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.babyJubJubGeneratePrivateKey = babyJubJubGeneratePrivateKey;
exports.babyJubJubGeneratePublicKey = babyJubJubGeneratePublicKey;
exports.babyJubJubSignature = babyJubJubSignature;
exports.babyJubJubVerify = babyJubJubVerify;
exports.packSignature = packSignature;
exports.packPoint = packPoint;
exports.hash = hash;
exports.unpackSignature = unpackSignature;
exports.unpackPoint = unpackPoint;
const circomlibjs_1 = require("circomlibjs");
let eddsa;
let babyjubjub;
let pedersenHash;
async function initBabyJub() {
    if (!babyjubjub) {
        babyjubjub = await (0, circomlibjs_1.buildBabyjub)();
    }
}
async function initEddsa() {
    if (!eddsa) {
        eddsa = await (0, circomlibjs_1.buildEddsa)();
    }
}
async function initPedersenHash() {
    if (!pedersenHash) {
        pedersenHash = await (0, circomlibjs_1.buildPedersenHash)();
    }
}
async function babyJubJubGeneratePrivateKey() {
    await initBabyJub();
    return babyjubjub.F.random();
}
async function babyJubJubGeneratePublicKey(privateKey) {
    await initEddsa();
    return eddsa.prv2pub(privateKey);
}
async function babyJubJubSignature(msg, privateKey) {
    await initEddsa();
    return eddsa.signPedersen(privateKey, msg);
}
async function babyJubJubVerify(msg, signature, publicKey) {
    await initEddsa();
    return eddsa.verifyPedersen(msg, signature, publicKey);
}
async function packSignature(signature) {
    await initEddsa();
    return eddsa.packSignature(signature);
}
async function packPoint(point) {
    await initBabyJub();
    return babyjubjub.packPoint(point);
}
async function unpackPoint(buffer) {
    await initBabyJub();
    return babyjubjub.unpackPoint(buffer);
}
async function hash(msg) {
    await initPedersenHash();
    return pedersenHash.hash(msg);
}
async function unpackSignature(signBuff) {
    await initEddsa();
    return eddsa.unpackSignature(signBuff);
}
//# sourceMappingURL=crypto.js.map