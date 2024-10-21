import { signData, genKeyPair } from '0g-zk-settlement-client';
export async function createKey() {
    let keyPair;
    try {
        keyPair = await genKeyPair();
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
export async function sign(requests, privateKey) {
    let signatures;
    try {
        signatures = await signData(requests, privateKey);
        const jsonString = JSON.stringify(Array.from(signatures[0]));
        return jsonString;
    }
    catch (error) {
        throw error;
    }
}
//# sourceMappingURL=zk.js.map