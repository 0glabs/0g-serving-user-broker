"use strict";
// import { signData, genKeyPair } from '0g-zk-settlement-client'
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKey = createKey;
exports.sign = sign;
async function createKey() {
    let keyPair;
    try {
        keyPair = {
            packPrivkey0: BigInt('123123'),
            packPrivkey1: BigInt('123123'),
            packedPubkey0: BigInt('123123'),
            packedPubkey1: BigInt('123123'),
        };
        // keyPair = await genKeyPair()
        return [
            [keyPair.packPrivkey0, keyPair.packPrivkey1],
            [keyPair.packedPubkey0, keyPair.packedPubkey1],
        ];
    }
    catch (error) {
        console.error('Create ZK key error', error);
        throw error;
    }
}
async function sign(requests, privateKey) {
    try {
        // signatures = await signData(requests, privateKey)
        // const jsonString = JSON.stringify(Array.from(signatures[0]))
        // return jsonString
        return '123123';
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=zk.js.map