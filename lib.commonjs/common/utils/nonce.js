"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonceWithCache = getNonceWithCache;
exports.getNonce = getNonce;
const storage_1 = require("../storage");
async function getNonceWithCache(cache) {
    const lockKey = 'nonce_lock';
    const nonceKey = 'nonce';
    while (!(await acquireLock(cache, lockKey))) {
        await delay(10);
    }
    try {
        const now = new Date();
        const lastNonce = cache.getItem(nonceKey) || 0;
        let nonce = now.getTime() * 10000 + 40;
        if (lastNonce >= nonce) {
            nonce = lastNonce + 40;
        }
        cache.setItem(nonceKey, nonce, 10000000 * 60 * 1000, storage_1.CacheValueTypeEnum.Other);
        return nonce;
    }
    finally {
        await releaseLock(cache, lockKey);
    }
}
function getNonce() {
    const now = new Date();
    return now.getTime() * 10000 + 40;
}
async function acquireLock(cache, key) {
    const lock = await cache.setLock(key, 'true', 1000, storage_1.CacheValueTypeEnum.Other);
    return lock;
}
async function releaseLock(cache, key) {
    await cache.removeLock(key);
}
function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
//# sourceMappingURL=nonce.js.map