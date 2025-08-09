"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = void 0;
class Metadata {
    nodeStorage = {};
    initialized = false;
    isBrowser = typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined';
    storagePrefix = '0g_metadata_';
    constructor() { }
    async initialize() {
        if (this.initialized) {
            return;
        }
        if (!this.isBrowser) {
            this.nodeStorage = {};
        }
        this.initialized = true;
    }
    async setItem(key, value) {
        await this.initialize();
        const fullKey = this.storagePrefix + key;
        if (this.isBrowser) {
            try {
                console.log('Setting localStorage item:', fullKey, value);
                window.localStorage.setItem(fullKey, value);
            }
            catch (e) {
                console.warn('Failed to set localStorage item:', e);
                this.nodeStorage[key] = value;
            }
        }
        else {
            this.nodeStorage[key] = value;
        }
    }
    async getItem(key) {
        await this.initialize();
        const fullKey = this.storagePrefix + key;
        if (this.isBrowser) {
            try {
                return window.localStorage.getItem(fullKey);
            }
            catch (e) {
                console.warn('Failed to get localStorage item:', e);
                return this.nodeStorage[key] ?? null;
            }
        }
        else {
            return this.nodeStorage[key] ?? null;
        }
    }
    async storeSettleSignerPrivateKey(key, value) {
        const bigIntStringArray = value.map((bi) => bi.toString());
        const bigIntJsonString = JSON.stringify(bigIntStringArray);
        await this.setItem(`${key}_settleSignerPrivateKey`, bigIntJsonString);
    }
    async storeSigningKey(key, value) {
        await this.setItem(`${key}_signingKey`, value);
    }
    async getSettleSignerPrivateKey(key) {
        const value = await this.getItem(`${key}_settleSignerPrivateKey`);
        if (!value) {
            return null;
        }
        const bigIntStringArray = JSON.parse(value);
        return bigIntStringArray.map((str) => BigInt(str));
    }
    async getSigningKey(key) {
        const value = await this.getItem(`${key}_signingKey`);
        return value ?? null;
    }
}
exports.Metadata = Metadata;
//# sourceMappingURL=metadata.js.map