"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIELD_SIZE = void 0;
exports.signRequests = signRequests;
const crypto_1 = require("./crypto");
exports.FIELD_SIZE = 32;
async function signRequests(requests, privateKey) {
    const serializedRequestTrace = requests.map((request) => request.serialize());
    const signatures = [];
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await (0, crypto_1.babyJubJubSignature)(serializedRequestTrace[i], privateKey);
        signatures.push(await (0, crypto_1.packSignature)(signature));
    }
    return signatures;
}
//# sourceMappingURL=helper.js.map