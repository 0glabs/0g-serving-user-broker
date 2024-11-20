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
exports.Cache = exports.CacheValueTypeEnum = void 0;
var CacheValueTypeEnum;
(function (CacheValueTypeEnum) {
    CacheValueTypeEnum["Service"] = "service";
})(CacheValueTypeEnum || (exports.CacheValueTypeEnum = CacheValueTypeEnum = {}));
class Cache {
    isBrowser = typeof window !== 'undefined' &&
        typeof window.localStorage !== 'undefined';
    nodeStorageFilePath = '';
    nodeStorage = {};
    initialized = false;
    customPath;
    constructor(customPath) {
        this.customPath = customPath;
    }
    async setItem(key, value, ttl, type) {
        await this.initialize();
        const now = new Date();
        const item = {
            type,
            value: Cache.encodeValue(value),
            expiry: now.getTime() + ttl,
        };
        if (this.isBrowser) {
            localStorage.setItem(key, JSON.stringify(item));
        }
        else {
            this.nodeStorage[key] = JSON.stringify(item);
            await this.saveNodeStorage();
        }
    }
    async getItem(key) {
        await this.initialize();
        let itemStr;
        if (this.isBrowser) {
            itemStr = localStorage.getItem(key);
        }
        else {
            itemStr = this.nodeStorage[key] ?? null;
        }
        if (!itemStr) {
            return null;
        }
        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
            if (this.isBrowser) {
                localStorage.removeItem(key);
            }
            else {
                delete this.nodeStorage[key];
                await this.saveNodeStorage();
            }
            return null;
        }
        return Cache.decodeValue(item.value, item.type);
    }
    async initialize() {
        console.log('this.initialized:', this.initialized);
        if (this.initialized) {
            return;
        }
        if (!this.isBrowser) {
            const fs = await Promise.resolve().then(() => __importStar(require('fs')));
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
    static encodeValue(value) {
        return JSON.stringify(value, (_, val) => typeof val === 'bigint' ? `${val.toString()}n` : val);
    }
    static decodeValue(encodedValue, type) {
        let ret = JSON.parse(encodedValue, (_, val) => {
            if (typeof val === 'string' && /^\d+n$/.test(val)) {
                return BigInt(val.slice(0, -1));
            }
            return val;
        });
        if (type === CacheValueTypeEnum.Service) {
            return Cache.createServiceStructOutput(ret);
        }
        return ret;
    }
    static createServiceStructOutput(fields) {
        const tuple = fields;
        const object = {
            provider: fields[0],
            name: fields[1],
            serviceType: fields[2],
            url: fields[3],
            inputPrice: fields[4],
            outputPrice: fields[5],
            updatedAt: fields[6],
            model: fields[7],
            verifiability: fields[8],
        };
        return Object.assign(tuple, object);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=cache.js.map