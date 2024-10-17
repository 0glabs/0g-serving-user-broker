// import { signData, getSignKeyPair } from '0g-zksettlement/server/client'
export async function createKey() {
    const privateKey = Math.floor(Math.random() * 10000);
    return new Promise((resolve, reject) => {
        return resolve([BigInt(privateKey)]);
    });
    // const keyPair = await getSignKeyPair()
    // return keyPair.privkey as bigint[]
}
export async function sign(requests, privateKey) {
    return new Promise((resolve, reject) => {
        return resolve(privateKey.toString());
    });
    // const signatures = await signData(requests, privateKey)
    // return signatures.toString()
}
//# sourceMappingURL=zk.js.map