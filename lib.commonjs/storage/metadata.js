"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Metadata = void 0;
class Metadata {
    isBrowser = typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined';
    nodeStorageFilePath = '';
    nodeStorage = {};
    initialized = false;
    customPath;
    constructor(customPath) {
        this.customPath = customPath;
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        if (!this.isBrowser) {
            // const path = await import('path')
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            // this.nodeStorageFilePath = path.join(this.customPath, 'nodeStorage.json')
            this.nodeStorageFilePath = this.customPath;
            this.nodeStorage = this.loadNodeStorage(fs);
        }
        else {
            this.nodeStorage = {};
        }
        this.initialized = true;
    }
    loadNodeStorage(fs) {
        if (fs.existsSync(this.nodeStorageFilePath)) {
            const data = fs.readFileSync(this.nodeStorageFilePath, 'utf-8');
            if (!data) {
                return {};
            }
            return JSON.parse(data);
        }
        return {};
    }
    async saveNodeStorage() {
        if (!this.isBrowser) {
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            fs.writeFileSync(this.nodeStorageFilePath, JSON.stringify(this.nodeStorage, null, 2), 'utf-8');
        }
    }
    async setItem(key, value) {
        await this.initialize();
        if (this.isBrowser) {
            localStorage.setItem(key, value);
        }
        else {
            this.nodeStorage[key] = value;
            await this.saveNodeStorage();
        }
    }
    async getItem(key) {
        await this.initialize();
        if (this.isBrowser) {
            return localStorage.getItem(key);
        }
        else {
            return this.nodeStorage[key] ?? null;
        }
    }
    async storeNonce(key, value) {
        await this.setItem(`${key}_nonce`, value.toString());
    }
    async storeOutputFee(key, value) {
        await this.setItem(`${key}_outputFee`, value.toString());
    }
    async storeSettleSignerPrivateKey(key, value) {
        const bigIntStringArray = value.map((bi) => bi.toString());
        const bigIntJsonString = JSON.stringify(bigIntStringArray);
        await this.setItem(`${key}_settleSignerPrivateKey`, bigIntJsonString);
    }
    async storeSigningKey(key, value) {
        await this.setItem(`${key}_signingKey`, value);
    }
    async getNonce(key) {
        const value = await this.getItem(`${key}_nonce`);
        return value ? parseInt(value, 10) : null;
    }
    async getOutputFee(key) {
        const value = await this.getItem(`${key}_outputFee`);
        return value ? parseInt(value, 10) : null;
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