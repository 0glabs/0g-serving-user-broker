"use strict";
// import { signData, getSignKeyPair } from '0g-zksettlement/server/client'
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKey = createKey;
exports.sign = sign;
async function createKey() {
    const privateKey = Math.floor(Math.random() * 10000);
    return new Promise((resolve, reject) => {
        return resolve([BigInt(privateKey)]);
    });
    // const keyPair = await getSignKeyPair()
    // return keyPair.privkey as bigint[]
}
async function sign(requests, privateKey) {
    return new Promise((resolve, reject) => {
        return resolve(privateKey.toString());
    });
    // const signatures = await signData(requests, privateKey)
    // return signatures.toString()
}
//# sourceMappingURL=zk.js.map