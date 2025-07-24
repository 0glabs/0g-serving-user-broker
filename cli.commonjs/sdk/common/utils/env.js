"use strict";
/**
 * Environment detection utility
 * Helps distinguish between Node.js and browser environments
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasWebCrypto = exports.isWebWorker = exports.isNode = exports.isBrowser = void 0;
const isBrowser = () => {
    return typeof window !== 'undefined' && typeof window.document !== 'undefined';
};
exports.isBrowser = isBrowser;
const isNode = () => {
    return typeof process !== 'undefined' &&
        process.versions &&
        process.versions.node !== undefined;
};
exports.isNode = isNode;
const isWebWorker = () => {
    return typeof globalThis.importScripts === 'function' && typeof navigator !== 'undefined';
};
exports.isWebWorker = isWebWorker;
const hasWebCrypto = () => {
    return (0, exports.isBrowser)() &&
        typeof window.crypto !== 'undefined' &&
        typeof window.crypto.subtle !== 'undefined';
};
exports.hasWebCrypto = hasWebCrypto;
//# sourceMappingURL=env.js.map