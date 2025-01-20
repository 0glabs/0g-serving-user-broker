"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.babyJubJubGeneratePrivateKey = babyJubJubGeneratePrivateKey;
exports.babyJubJubGeneratePublicKey = babyJubJubGeneratePublicKey;
exports.babyJubJubSignature = babyJubJubSignature;
exports.packSignature = packSignature;
exports.packPoint = packPoint;
const circomlibjs_1 = require("circomlibjs");
let eddsa;
let babyjubjub;
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
async function packSignature(signature) {
    await initEddsa();
    return eddsa.packSignature(signature);
}
async function packPoint(point) {
    await initBabyJub();
    return babyjubjub.packPoint(point);
}
//# sourceMappingURL=crypto.js.map