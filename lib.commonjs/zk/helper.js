"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIELD_SIZE = void 0;
exports.generateProofInput = generateProofInput;
exports.signAndVerifyRequests = signAndVerifyRequests;
exports.signRequests = signRequests;
exports.verifySig = verifySig;
exports.genPubkey = genPubkey;
const crypto_1 = require("./crypto");
const request_1 = require("./request");
exports.FIELD_SIZE = 32;
async function generateProofInput(requests, l, pubkey, signBuff) {
    const r8 = [];
    const s = [];
    for (let i = 0; i < signBuff.length; i++) {
        r8.push(new Uint8Array(signBuff[i].slice(0, exports.FIELD_SIZE)));
        s.push(new Uint8Array(signBuff[i].slice(exports.FIELD_SIZE, exports.FIELD_SIZE * 2)));
    }
    const paddingResult = paddingSignature(requests, r8, s, l);
    const input = {
        serializedRequest: paddingResult.serializedRequestTrace,
        signer: pubkey,
        r8: paddingResult.r8,
        s: paddingResult.s,
    };
    return input;
}
async function signAndVerifyRequests(requests, privateKey, publicKey) {
    const packPubkey = await (0, crypto_1.packPoint)(publicKey);
    const signatures = [];
    const r8 = [];
    const s = [];
    const serializedRequestTrace = requests.map((request) => request.serialize());
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await (0, crypto_1.babyJubJubSignature)(serializedRequestTrace[i], privateKey);
        signatures.push(signature);
        await (0, crypto_1.babyJubJubVerify)(serializedRequestTrace[i], signature, publicKey);
        const packedSig = await (0, crypto_1.packSignature)(signature);
        r8.push(packedSig.slice(0, exports.FIELD_SIZE));
        s.push(packedSig.slice(exports.FIELD_SIZE, exports.FIELD_SIZE * 2));
    }
    return { packPubkey, r8, s };
}
async function signRequests(requests, privateKey) {
    const serializedRequestTrace = requests.map((request) => request.serialize());
    const signatures = [];
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await (0, crypto_1.babyJubJubSignature)(serializedRequestTrace[i], privateKey);
        signatures.push(await (0, crypto_1.packSignature)(signature));
    }
    return signatures;
}
async function verifySig(requests, packedSignatures, publicKey) {
    const isValid = [];
    const serializedRequestTrace = requests.map((request) => request.serialize());
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await (0, crypto_1.unpackSignature)(packedSignatures[i]);
        isValid.push(await (0, crypto_1.babyJubJubVerify)(serializedRequestTrace[i], signature, publicKey));
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
    let currentNonce = lastRequest.getNonce();
    for (let i = requests.length; i < l; i++) {
        currentNonce += 1;
        const noopRequest = new request_1.Request(currentNonce, 0, '0x' + lastRequest.getUserAddress().toString(16), '0x' + lastRequest.getProviderAddress().toString(16));
        requests.push(noopRequest);
        r8.push(lastR8);
        s.push(lastS);
    }
    const serializedRequestTrace = requests.map((request) => request.serialize());
    return { serializedRequestTrace, r8, s };
}
async function genPubkey(privkey) {
    return (0, crypto_1.babyJubJubGeneratePublicKey)(privkey);
}
//# sourceMappingURL=helper.js.map