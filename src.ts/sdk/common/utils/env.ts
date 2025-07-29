/**
 * Environment detection utility
 * Helps distinguish between Node.js and browser environments
 */

export const isBrowser = (): boolean => {
    return (
        typeof window !== 'undefined' && typeof window.document !== 'undefined'
    )
}

export const isNode = (): boolean => {
    return (
        typeof process !== 'undefined' &&
        process.versions &&
        process.versions.node !== undefined
    )
}

export const isWebWorker = (): boolean => {
    return (
        typeof (globalThis as any).importScripts === 'function' &&
        typeof navigator !== 'undefined'
    )
}

export const hasWebCrypto = (): boolean => {
    return (
        isBrowser() &&
        typeof window.crypto !== 'undefined' &&
        typeof window.crypto.subtle !== 'undefined'
    )
}
