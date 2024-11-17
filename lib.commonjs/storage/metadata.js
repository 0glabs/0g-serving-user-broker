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
    static isBrowser = typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined';
    static nodeStorageFilePath;
    static nodeStorage;
    static initialized = false;
    static async initialize() {
        if (this.initialized) {
            return;
        }
        console.log('TTTTTTTTTTTTTTTTTTxaaaaaaaaaaaaaaa', this.nodeStorage);
        if (!this.isBrowser) {
            const path = await Promise.resolve().then(() => __importStar(require('path')));
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
            this.nodeStorageFilePath = path.join(__dirname, 'nodeStorage.json');
            this.nodeStorage = this.loadNodeStorage(fs.default);
            console.log('TTTTTTTTTTTTTTTTTTbbbbbbbbbbbb', this.nodeStorage);
        }
        else {
            this.nodeStorage = {};
        }
        this.initialized = true;
    }
    static loadNodeStorage(fs) {
        if (fs.existsSync(this.nodeStorageFilePath)) {
            const data = fs.readFileSync(this.nodeStorageFilePath, 'utf-8');
            return JSON.parse(data);
        }
        return {};
    }
    static saveNodeStorage() {
        if (!this.isBrowser) {
            console.log('!isBrowser');
            const fs = require('fs');
            fs.writeFileSync(this.nodeStorageFilePath, JSON.stringify(this.nodeStorage, null, 2), 'utf-8');
        }
    }
    static setItem(key, value) {
        this.initialize();
        if (this.isBrowser) {
            localStorage.setItem(key, value);
        }
        else {
            this.nodeStorage[key] = value;
            this.saveNodeStorage();
        }
    }
    static getItem(key) {
        this.initialize();
        if (this.isBrowser) {
            return localStorage.getItem(key);
        }
        else {
            return this.nodeStorage[key] ?? null;
        }
    }
    static storeNonce(key, value) {
        this.setItem(`${key}_nonce`, value.toString());
    }
    static storeOutputFee(key, value) {
        this.setItem(`${key}_outputFee`, value.toString());
    }
    static storeZKPrivateKey(key, value) {
        const bigIntStringArray = value.map((bi) => bi.toString());
        const bigIntJsonString = JSON.stringify(bigIntStringArray);
        this.setItem(`${key}_privateKey`, bigIntJsonString);
    }
    static storeSigningKey(key, value) {
        this.setItem(`${key}_signingKey`, value);
    }
    static getNonce(key) {
        const value = this.getItem(`${key}_nonce`);
        return value ? parseInt(value, 10) : null;
    }
    static getOutputFee(key) {
        const value = this.getItem(`${key}_outputFee`);
        return value ? parseInt(value, 10) : null;
    }
    static getZKPrivateKey(key) {
        const value = this.getItem(`${key}_privateKey`);
        if (!value) {
            return null;
        }
        const bigIntStringArray = JSON.parse(value);
        return bigIntStringArray.map((str) => BigInt(str));
    }
    static getSigningKey(key) {
        const value = this.getItem(`${key}_signingKey`);
        return value ?? null;
    }
}
exports.Metadata = Metadata;
//# sourceMappingURL=metadata.js.map