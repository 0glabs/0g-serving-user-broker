import type { Cache } from '../storage'
import { CacheValueTypeEnum, CACHE_KEYS } from '../storage'

export async function getNonceWithCache(cache: Cache): Promise<number> {
    const lockKey = CACHE_KEYS.NONCE_LOCK
    const nonceKey = CACHE_KEYS.NONCE

    while (!(await acquireLock(cache, lockKey))) {
        await delay(10)
    }

    try {
        const now = new Date()
        const lastNonce: number = cache.getItem(nonceKey) || 0
        let nonce = now.getTime() * 10000 + 40

        if (lastNonce >= nonce) {
            nonce = lastNonce + 40
        }

        cache.setItem(
            nonceKey,
            nonce,
            10000000 * 60 * 1000,
            CacheValueTypeEnum.Other
        )
        return nonce
    } finally {
        await releaseLock(cache, lockKey)
    }
}

export function getNonce(): number {
    const now = new Date()
    return now.getTime() * 10000 + 40
}

async function acquireLock(cache: Cache, key: string): Promise<boolean> {
    const lock = await cache.setLock(
        key,
        'true',
        1000,
        CacheValueTypeEnum.Other
    )
    return lock
}

async function releaseLock(cache: Cache, key: string): Promise<void> {
    await cache.removeLock(key)
}

function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}
