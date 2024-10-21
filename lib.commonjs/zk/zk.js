"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createKey = createKey;
exports.sign = sign;
const _0g_zk_settlement_client_1 = require("0g-zk-settlement-client");
async function createKey() {
    let keyPair;
    try {
        keyPair = await (0, _0g_zk_settlement_client_1.genKeyPair)();
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
    let signatures;
    try {
        signatures = await (0, _0g_zk_settlement_client_1.signData)(requests, privateKey);
        const jsonString = JSON.stringify(Array.from(signatures[0]));
        return jsonString;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=zk.js.map