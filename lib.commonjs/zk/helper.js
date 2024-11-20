"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProofInput = generateProofInput;
exports.signAndVerifyRequests = signAndVerifyRequests;
exports.signRequests = signRequests;
exports.verifySig = verifySig;
exports.genPubkey = genPubkey;
const crypto_1 = require("./crypto");
const request_1 = require("./request");
async function generateProofInput(requests, l, pubkey, signBuff) {
    const r8 = [];
    const s = [];
    for (let i = 0; i < signBuff.length; i++) {
        r8.push(new Uint8Array(signBuff[i].slice(0, 32)));
        s.push(new Uint8Array(signBuff[i].slice(32, 64)));
    }
    const paddingResult = paddingSignature(requests, r8, s, l);
    const input = {
        serializedRequest: paddingResult.serializedRequestTrace,
        signer: pubkey,
        r8: paddingResult.r8,
        s: paddingResult.s
    };
    return input;
}
async function signAndVerifyRequests(requests, babyJubJubPrivateKey, babyJubJubPublicKey) {
    const packPubkey = await (0, crypto_1.packPoint)(babyJubJubPublicKey);
    const signatures = [];
    const r8 = [];
    const s = [];
    const serializedRequestTrace = requests.map(request => request.serialize());
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await (0, crypto_1.babyJubJubSignature)(serializedRequestTrace[i], babyJubJubPrivateKey);
        signatures.push(signature);
        const isValid = await (0, crypto_1.babyJubJubVerify)(serializedRequestTrace[i], signature, babyJubJubPublicKey);
        console.log("Signature", i, "is valid:", isValid);
        const packedSig = await (0, crypto_1.packSignature)(signature);
        r8.push(packedSig.slice(0, 32));
        s.push(packedSig.slice(32, 64));
    }
    return { packPubkey, r8, s };
}
async function signRequests(requests, babyJubJubPrivateKey) {
    const serializedRequestTrace = requests.map(request => request.serialize());
    const signatures = [];
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await (0, crypto_1.babyJubJubSignature)(serializedRequestTrace[i], babyJubJubPrivateKey);
        signatures.push(await (0, crypto_1.packSignature)(signature));
    }
    return signatures;
}
async function verifySig(requests, signatures, pubkey) {
    const unpackPubkey = new Uint8Array(32);
    unpackPubkey.set(pubkey[0], 0);
    unpackPubkey.set(pubkey[1], 16);
    const babyJubJubPublicKey = await (0, crypto_1.unpackPoint)(unpackPubkey);
    const isValid = [];
    const serializedRequestTrace = requests.map(request => request.serialize());
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const unpackedSignature = await (0, crypto_1.unpackSignature)(new Uint8Array(signatures[i]));
        isValid.push(await (0, crypto_1.babyJubJubVerify)(serializedRequestTrace[i], unpackedSignature, babyJubJubPublicKey));
    }
    return isValid;
}
function paddingSignature(requests, r8, s, l) {
    if (l < requests.length) {
        throw new Error('l must be greater than or equal to the length of serializedRequestTrace');
    }
    const lastRequest = requests[requests.length - 1];
    const lastR8 = r8[r8.length - 1];
    const lastS = s[s.length - 1];
    let currentNonce = lastRequest.getNonce(); // 使用getter方法
    for (let i = requests.length; i < l; i++) {
        currentNonce += 1;
        const noopRequest = new request_1.Request(currentNonce, 0, '0x' + lastRequest.getUserAddress().toString(16), // 使用getter方法
        '0x' + lastRequest.getProviderAddress().toString(16) // 使用getter方法
        );
        requests.push(noopRequest);
        r8.push(lastR8);
        s.push(lastS);
    }
    const serializedRequestTrace = requests.map(request => request.serialize());
    return { serializedRequestTrace, r8, s };
}
async function genPubkey(privkey) {
    return (0, crypto_1.babyJubJubGeneratePublicKey)(privkey);
}
//# sourceMappingURL=helper.js.map