import { Interface, Contract, ContractFactory, ethers } from 'ethers';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var Metadata = /** @class */ (function () {
    function Metadata(customPath) {
        this.isBrowser = typeof window !== 'undefined' &&
            typeof window.localStorage !== 'undefined';
        this.nodeStorageFilePath = '';
        this.nodeStorage = {};
        this.initialized = false;
        this.customPath = customPath;
    }
    Metadata.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.initialized) {
                            return [2 /*return*/];
                        }
                        if (!!this.isBrowser) return [3 /*break*/, 2];
                        return [4 /*yield*/, import('fs')
                            // this.nodeStorageFilePath = path.join(this.customPath, 'nodeStorage.json')
                        ];
                    case 1:
                        fs = _a.sent();
                        // this.nodeStorageFilePath = path.join(this.customPath, 'nodeStorage.json')
                        this.nodeStorageFilePath = this.customPath;
                        this.nodeStorage = this.loadNodeStorage(fs);
                        return [3 /*break*/, 3];
                    case 2:
                        this.nodeStorage = {};
                        _a.label = 3;
                    case 3:
                        this.initialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Metadata.prototype.loadNodeStorage = function (fs) {
        if (fs.existsSync(this.nodeStorageFilePath)) {
            var data = fs.readFileSync(this.nodeStorageFilePath, 'utf-8');
            if (!data) {
                return {};
            }
            return JSON.parse(data);
        }
        return {};
    };
    Metadata.prototype.saveNodeStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isBrowser) return [3 /*break*/, 2];
                        return [4 /*yield*/, import('fs')];
                    case 1:
                        fs = _a.sent();
                        fs.writeFileSync(this.nodeStorageFilePath, JSON.stringify(this.nodeStorage, null, 2), 'utf-8');
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Metadata.prototype.setItem = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        if (!this.isBrowser) return [3 /*break*/, 2];
                        localStorage.setItem(key, value);
                        return [3 /*break*/, 4];
                    case 2:
                        this.nodeStorage[key] = value;
                        return [4 /*yield*/, this.saveNodeStorage()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Metadata.prototype.getItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _b.sent();
                        if (this.isBrowser) {
                            return [2 /*return*/, localStorage.getItem(key)];
                        }
                        else {
                            return [2 /*return*/, (_a = this.nodeStorage[key]) !== null && _a !== void 0 ? _a : null];
                        }
                }
            });
        });
    };
    Metadata.prototype.storeNonce = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setItem("".concat(key, "_nonce"), value.toString())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Metadata.prototype.storeOutputFee = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setItem("".concat(key, "_outputFee"), value.toString())];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Metadata.prototype.storeZKPrivateKey = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var bigIntStringArray, bigIntJsonString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bigIntStringArray = value.map(function (bi) { return bi.toString(); });
                        bigIntJsonString = JSON.stringify(bigIntStringArray);
                        return [4 /*yield*/, this.setItem("".concat(key, "_zkPrivateKey"), bigIntJsonString)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Metadata.prototype.storeSigningKey = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.setItem("".concat(key, "_signingKey"), value)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Metadata.prototype.getNonce = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getItem("".concat(key, "_nonce"))];
                    case 1:
                        value = _a.sent();
                        return [2 /*return*/, value ? parseInt(value, 10) : null];
                }
            });
        });
    };
    Metadata.prototype.getOutputFee = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getItem("".concat(key, "_outputFee"))];
                    case 1:
                        value = _a.sent();
                        return [2 /*return*/, value ? parseInt(value, 10) : null];
                }
            });
        });
    };
    Metadata.prototype.getZKPrivateKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var value, bigIntStringArray;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getItem("".concat(key, "_zkPrivateKey"))];
                    case 1:
                        value = _a.sent();
                        if (!value) {
                            return [2 /*return*/, null];
                        }
                        bigIntStringArray = JSON.parse(value);
                        return [2 /*return*/, bigIntStringArray.map(function (str) { return BigInt(str); })];
                }
            });
        });
    };
    Metadata.prototype.getSigningKey = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var value;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getItem("".concat(key, "_signingKey"))];
                    case 1:
                        value = _a.sent();
                        return [2 /*return*/, value !== null && value !== void 0 ? value : null];
                }
            });
        });
    };
    return Metadata;
}());

var CacheValueTypeEnum;
(function (CacheValueTypeEnum) {
    CacheValueTypeEnum["Service"] = "service";
})(CacheValueTypeEnum || (CacheValueTypeEnum = {}));
var Cache = /** @class */ (function () {
    function Cache(customPath) {
        this.isBrowser = typeof window !== 'undefined' &&
            typeof window.localStorage !== 'undefined';
        this.nodeStorageFilePath = '';
        this.nodeStorage = {};
        this.initialized = false;
        this.customPath = customPath;
    }
    Cache.prototype.setItem = function (key, value, ttl, type) {
        return __awaiter(this, void 0, void 0, function () {
            var now, item;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _a.sent();
                        now = new Date();
                        item = {
                            type: type,
                            value: Cache.encodeValue(value),
                            expiry: now.getTime() + ttl,
                        };
                        if (!this.isBrowser) return [3 /*break*/, 2];
                        localStorage.setItem(key, JSON.stringify(item));
                        return [3 /*break*/, 4];
                    case 2:
                        this.nodeStorage[key] = JSON.stringify(item);
                        return [4 /*yield*/, this.saveNodeStorage()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    Cache.prototype.getItem = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var itemStr, item, now;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.initialize()];
                    case 1:
                        _b.sent();
                        if (this.isBrowser) {
                            itemStr = localStorage.getItem(key);
                        }
                        else {
                            itemStr = (_a = this.nodeStorage[key]) !== null && _a !== void 0 ? _a : null;
                        }
                        if (!itemStr) {
                            return [2 /*return*/, null];
                        }
                        item = JSON.parse(itemStr);
                        now = new Date();
                        if (!(now.getTime() > item.expiry)) return [3 /*break*/, 5];
                        if (!this.isBrowser) return [3 /*break*/, 2];
                        localStorage.removeItem(key);
                        return [3 /*break*/, 4];
                    case 2:
                        delete this.nodeStorage[key];
                        return [4 /*yield*/, this.saveNodeStorage()];
                    case 3:
                        _b.sent();
                        _b.label = 4;
                    case 4: return [2 /*return*/, null];
                    case 5: return [2 /*return*/, Cache.decodeValue(item.value, item.type)];
                }
            });
        });
    };
    Cache.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log('this.initialized:', this.initialized);
                        if (this.initialized) {
                            return [2 /*return*/];
                        }
                        if (!!this.isBrowser) return [3 /*break*/, 2];
                        return [4 /*yield*/, import('fs')];
                    case 1:
                        fs = _a.sent();
                        this.nodeStorageFilePath = this.customPath;
                        this.nodeStorage = this.loadNodeStorage(fs);
                        return [3 /*break*/, 3];
                    case 2:
                        this.nodeStorage = {};
                        _a.label = 3;
                    case 3:
                        this.initialized = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Cache.prototype.loadNodeStorage = function (fs) {
        if (fs.existsSync(this.nodeStorageFilePath)) {
            var data = fs.readFileSync(this.nodeStorageFilePath, 'utf-8');
            if (!data) {
                return {};
            }
            return JSON.parse(data);
        }
        return {};
    };
    Cache.prototype.saveNodeStorage = function () {
        return __awaiter(this, void 0, void 0, function () {
            var fs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!this.isBrowser) return [3 /*break*/, 2];
                        return [4 /*yield*/, import('fs')];
                    case 1:
                        fs = _a.sent();
                        fs.writeFileSync(this.nodeStorageFilePath, JSON.stringify(this.nodeStorage, null, 2), 'utf-8');
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    Cache.encodeValue = function (value) {
        return JSON.stringify(value, function (_, val) {
            return typeof val === 'bigint' ? "".concat(val.toString(), "n") : val;
        });
    };
    Cache.decodeValue = function (encodedValue, type) {
        var ret = JSON.parse(encodedValue, function (_, val) {
            if (typeof val === 'string' && /^\d+n$/.test(val)) {
                return BigInt(val.slice(0, -1));
            }
            return val;
        });
        if (type === CacheValueTypeEnum.Service) {
            return Cache.createServiceStructOutput(ret);
        }
        return ret;
    };
    Cache.createServiceStructOutput = function (fields) {
        var tuple = fields;
        var object = {
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
    };
    return Cache;
}());

var Extractor = /** @class */ (function () {
    function Extractor() {
    }
    return Extractor;
}());

var ChatBot = /** @class */ (function (_super) {
    __extends(ChatBot, _super);
    function ChatBot(svcInfo) {
        var _this = _super.call(this) || this;
        _this.svcInfo = svcInfo;
        return _this;
    }
    ChatBot.prototype.getSvcInfo = function () {
        return Promise.resolve(this.svcInfo);
    };
    ChatBot.prototype.getInputCount = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, content.split(/\s+/).length];
            });
        });
    };
    ChatBot.prototype.getOutputCount = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, content.split(/\s+/).length];
            });
        });
    };
    return ChatBot;
}(Extractor));

var ZGServingUserBrokerBase = /** @class */ (function () {
    function ZGServingUserBrokerBase(contract, metadata, cache) {
        this.contract = contract;
        this.metadata = metadata;
        this.cache = cache;
    }
    ZGServingUserBrokerBase.prototype.getProviderData = function (providerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var key, _a, nonce, outputFee, zkPrivateKey;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        key = "".concat(this.contract.getUserAddress(), "_").concat(providerAddress);
                        return [4 /*yield*/, Promise.all([
                                this.metadata.getNonce(key),
                                this.metadata.getOutputFee(key),
                                this.metadata.getZKPrivateKey(key),
                            ])];
                    case 1:
                        _a = _b.sent(), nonce = _a[0], outputFee = _a[1], zkPrivateKey = _a[2];
                        return [2 /*return*/, { nonce: nonce, outputFee: outputFee, zkPrivateKey: zkPrivateKey }];
                }
            });
        });
    };
    ZGServingUserBrokerBase.prototype.getService = function (providerAddress_1, svcName_1) {
        return __awaiter(this, arguments, void 0, function (providerAddress, svcName, useCache) {
            var key, cachedSvc, svc, error_1;
            if (useCache === void 0) { useCache = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = providerAddress + svcName;
                        return [4 /*yield*/, this.cache.getItem(key)];
                    case 1:
                        cachedSvc = _a.sent();
                        if (cachedSvc && useCache) {
                            return [2 /*return*/, cachedSvc];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 5, , 6]);
                        return [4 /*yield*/, this.contract.getService(providerAddress, svcName)];
                    case 3:
                        svc = _a.sent();
                        return [4 /*yield*/, this.cache.setItem(key, svc, 1 * 60 * 1000, CacheValueTypeEnum.Service)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, svc];
                    case 5:
                        error_1 = _a.sent();
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ZGServingUserBrokerBase.prototype.getExtractor = function (providerAddress_1, svcName_1) {
        return __awaiter(this, arguments, void 0, function (providerAddress, svcName, useCache) {
            var svc, extractor, error_2;
            if (useCache === void 0) { useCache = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getService(providerAddress, svcName, useCache)];
                    case 1:
                        svc = _a.sent();
                        extractor = this.createExtractor(svc);
                        return [2 /*return*/, extractor];
                    case 2:
                        error_2 = _a.sent();
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ZGServingUserBrokerBase.prototype.createExtractor = function (svc) {
        switch (svc.serviceType) {
            case 'chatbot':
                return new ChatBot(svc);
            default:
                throw new Error('Unknown service type');
        }
    };
    return ZGServingUserBrokerBase;
}());

// import { signData, genKeyPair } from '0g-zk-settlement-client'
function createKey() {
    return __awaiter(this, void 0, void 0, function () {
        var keyPair;
        return __generator(this, function (_a) {
            try {
                keyPair = {
                    packPrivkey0: BigInt('123123'),
                    packPrivkey1: BigInt('123123'),
                    packedPubkey0: BigInt('123123'),
                    packedPubkey1: BigInt('123123'),
                };
                // keyPair = await genKeyPair()
                return [2 /*return*/, [
                        [keyPair.packPrivkey0, keyPair.packPrivkey1],
                        [keyPair.packedPubkey0, keyPair.packedPubkey1],
                    ]];
            }
            catch (error) {
                console.error('Create ZK key error', error);
                throw error;
            }
            return [2 /*return*/];
        });
    });
}
function sign(requests, privateKey) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // signatures = await signData(requests, privateKey)
                // const jsonString = JSON.stringify(Array.from(signatures[0]))
                // return jsonString
                return [2 /*return*/, '123123'];
            }
            catch (error) {
                throw error;
            }
            return [2 /*return*/];
        });
    });
}

/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
var AccountProcessor = /** @class */ (function (_super) {
    __extends(AccountProcessor, _super);
    function AccountProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AccountProcessor.prototype.getAccount = function (user, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.contract.getAccount(user, provider)];
                    case 1:
                        accounts = _a.sent();
                        return [2 /*return*/, accounts];
                    case 2:
                        error_1 = _a.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AccountProcessor.prototype.listAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.contract.listAccount()];
                    case 1:
                        accounts = _a.sent();
                        return [2 /*return*/, accounts];
                    case 2:
                        error_2 = _a.sent();
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Adds a new account to the contract.
     *
     * This function performs the following steps:
     * 1. Creates and stores a key pair for the given provider address.
     * 2. Adds the account to the contract using the provider address, the generated public pair, and the specified balance.
     *
     * @param providerAddress - The address of the provider for whom the account is being created.
     * @param balance - The initial balance to be assigned to the new account.
     *
     * @remarks
     * When creating an account, a key pair is also created to sign the request.
     */
    AccountProcessor.prototype.addAccount = function (providerAddress, balance) {
        return __awaiter(this, void 0, void 0, function () {
            var zkSignerPublicKey, error_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.createAndStoreKey(providerAddress)];
                    case 1:
                        zkSignerPublicKey = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        throw error_3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.contract.addAccount(providerAddress, zkSignerPublicKey, balance)];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_4 = _a.sent();
                        throw error_4;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * depositFund deposits funds into a 0G Serving account.
     *
     * @param providerAddress - provider address.
     * @param balance - deposit amount.
     */
    AccountProcessor.prototype.depositFund = function (providerAddress, balance) {
        return __awaiter(this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.contract.depositFund(providerAddress, balance)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AccountProcessor.prototype.createAndStoreKey = function (providerAddress) {
        return __awaiter(this, void 0, void 0, function () {
            var keyPair, error_6, key;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, createKey()];
                    case 1:
                        keyPair = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_6 = _a.sent();
                        throw error_6;
                    case 3:
                        key = "".concat(this.contract.getUserAddress(), "_").concat(providerAddress);
                        // private key will be used for signing request
                        this.metadata.storeZKPrivateKey(key, keyPair[0]);
                        // public key will be used to create serving account
                        return [2 /*return*/, keyPair[1]];
                }
            });
        });
    };
    return AccountProcessor;
}(ZGServingUserBrokerBase));

var _abi = [
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
        ],
        name: "AccountExists",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
        ],
        name: "AccountNotexists",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
        ],
        name: "InsufficientBalance",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "reason",
                type: "string",
            },
        ],
        name: "InvalidProofInputs",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "RefundInvalid",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "RefundLocked",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
        ],
        name: "RefundProcessed",
        type: "error",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "ServiceNotexist",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "pendingRefund",
                type: "uint256",
            },
        ],
        name: "BalanceUpdated",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                indexed: true,
                internalType: "uint256",
                name: "index",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "timestamp",
                type: "uint256",
            },
        ],
        name: "RefundRequested",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "service",
                type: "address",
            },
            {
                indexed: true,
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "ServiceRemoved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "service",
                type: "address",
            },
            {
                indexed: true,
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "serviceType",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "url",
                type: "string",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "inputPrice",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "outputPrice",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "updatedAt",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "string",
                name: "model",
                type: "string",
            },
            {
                indexed: false,
                internalType: "string",
                name: "verifiability",
                type: "string",
            },
        ],
        name: "ServiceUpdated",
        type: "event",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint256[2]",
                name: "signer",
                type: "uint256[2]",
            },
        ],
        name: "addAccount",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
            {
                internalType: "string",
                name: "serviceType",
                type: "string",
            },
            {
                internalType: "string",
                name: "url",
                type: "string",
            },
            {
                internalType: "string",
                name: "model",
                type: "string",
            },
            {
                internalType: "string",
                name: "verifiability",
                type: "string",
            },
            {
                internalType: "uint256",
                name: "inputPrice",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "outputPrice",
                type: "uint256",
            },
        ],
        name: "addOrUpdateService",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "batchVerifierAddress",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
        ],
        name: "depositFund",
        outputs: [],
        stateMutability: "payable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
        ],
        name: "getAccount",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "user",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "provider",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "balance",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "pendingRefund",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256[2]",
                        name: "signer",
                        type: "uint256[2]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "index",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "amount",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "createdAt",
                                type: "uint256",
                            },
                            {
                                internalType: "bool",
                                name: "processed",
                                type: "bool",
                            },
                        ],
                        internalType: "struct Refund[]",
                        name: "refunds",
                        type: "tuple[]",
                    },
                ],
                internalType: "struct Account",
                name: "",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getAllAccounts",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "user",
                        type: "address",
                    },
                    {
                        internalType: "address",
                        name: "provider",
                        type: "address",
                    },
                    {
                        internalType: "uint256",
                        name: "nonce",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "balance",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "pendingRefund",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256[2]",
                        name: "signer",
                        type: "uint256[2]",
                    },
                    {
                        components: [
                            {
                                internalType: "uint256",
                                name: "index",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "amount",
                                type: "uint256",
                            },
                            {
                                internalType: "uint256",
                                name: "createdAt",
                                type: "uint256",
                            },
                            {
                                internalType: "bool",
                                name: "processed",
                                type: "bool",
                            },
                        ],
                        internalType: "struct Refund[]",
                        name: "refunds",
                        type: "tuple[]",
                    },
                ],
                internalType: "struct Account[]",
                name: "",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "getAllServices",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "provider",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "serviceType",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "url",
                        type: "string",
                    },
                    {
                        internalType: "uint256",
                        name: "inputPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "outputPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "updatedAt",
                        type: "uint256",
                    },
                    {
                        internalType: "string",
                        name: "model",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "verifiability",
                        type: "string",
                    },
                ],
                internalType: "struct Service[]",
                name: "services",
                type: "tuple[]",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "getService",
        outputs: [
            {
                components: [
                    {
                        internalType: "address",
                        name: "provider",
                        type: "address",
                    },
                    {
                        internalType: "string",
                        name: "name",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "serviceType",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "url",
                        type: "string",
                    },
                    {
                        internalType: "uint256",
                        name: "inputPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "outputPrice",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256",
                        name: "updatedAt",
                        type: "uint256",
                    },
                    {
                        internalType: "string",
                        name: "model",
                        type: "string",
                    },
                    {
                        internalType: "string",
                        name: "verifiability",
                        type: "string",
                    },
                ],
                internalType: "struct Service",
                name: "service",
                type: "tuple",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_locktime",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_batchVerifierAddress",
                type: "address",
            },
            {
                internalType: "address",
                name: "owner",
                type: "address",
            },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "initialized",
        outputs: [
            {
                internalType: "bool",
                name: "",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "lockTime",
        outputs: [
            {
                internalType: "uint256",
                name: "",
                type: "uint256",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint256[]",
                name: "indices",
                type: "uint256[]",
            },
        ],
        name: "processRefund",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "removeService",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "amount",
                type: "uint256",
            },
        ],
        name: "requestRefund",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint256[]",
                        name: "inProof",
                        type: "uint256[]",
                    },
                    {
                        internalType: "uint256[]",
                        name: "proofInputs",
                        type: "uint256[]",
                    },
                    {
                        internalType: "uint256",
                        name: "numChunks",
                        type: "uint256",
                    },
                    {
                        internalType: "uint256[]",
                        name: "segmentSize",
                        type: "uint256[]",
                    },
                ],
                internalType: "struct VerifierInput",
                name: "verifierInput",
                type: "tuple",
            },
        ],
        name: "settleFees",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_batchVerifierAddress",
                type: "address",
            },
        ],
        name: "updateBatchVerifierAddress",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint256",
                name: "_locktime",
                type: "uint256",
            },
        ],
        name: "updateLockTime",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
var _bytecode = "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b613157806200007f6000396000f3fe60806040526004361061011f5760003560e01c806378c00436116100a0578063e12d4a5211610064578063e12d4a5214610333578063f2fde38b14610346578063f51acaea14610366578063fbfa4e1114610386578063fd590847146103a657600080fd5b806378c00436146102a2578063850cd14e146102c25780638da5cb5b146102d557806399652de7146102f3578063b4988fd01461031357600080fd5b8063371c22c5116100e7578063371c22c5146101f35780634da824a81461022b5780636341b2d11461024d578063715018a61461026d578063746e78d71461028257600080fd5b806308e93d0a146101245780630d6680871461014f5780630e61d15814610173578063158ef93e146101a057806321fe0f30146101d1575b600080fd5b34801561013057600080fd5b506101396103d3565b604051610146919061272f565b60405180910390f35b34801561015b57600080fd5b5061016560015481565b604051908152602001610146565b34801561017f57600080fd5b5061019361018e366004612850565b6103e4565b604051610146919061299e565b3480156101ac57600080fd5b506000546101c190600160a01b900460ff1681565b6040519015158152602001610146565b3480156101dd57600080fd5b506101e6610719565b60405161014691906129b1565b3480156101ff57600080fd5b50600254610213906001600160a01b031681565b6040516001600160a01b039091168152602001610146565b34801561023757600080fd5b5061024b610246366004612a06565b610725565b005b34801561025957600080fd5b5061024b610268366004612ad5565b6107e3565b34801561027957600080fd5b5061024b61090e565b34801561028e57600080fd5b5061024b61029d366004612bca565b610922565b3480156102ae57600080fd5b5061024b6102bd366004612be5565b610956565b61024b6102d0366004612c20565b610f73565b3480156102e157600080fd5b506000546001600160a01b0316610213565b3480156102ff57600080fd5b5061024b61030e366004612c5a565b610fc4565b34801561031f57600080fd5b5061024b61032e366004612c84565b611028565b61024b610341366004612bca565b6110dc565b34801561035257600080fd5b5061024b610361366004612bca565b61112b565b34801561037257600080fd5b5061024b610381366004612cc0565b6111a4565b34801561039257600080fd5b5061024b6103a1366004612cf5565b6111f3565b3480156103b257600080fd5b506103c66103c1366004612d0e565b611200565b6040516101469190612d41565b60606103df600461131b565b905090565b6103ec6124fb565b6103f8600784846114c9565b60408051610120810190915281546001600160a01b0316815260018201805491929160208401919061042990612d54565b80601f016020809104026020016040519081016040528092919081815260200182805461045590612d54565b80156104a25780601f10610477576101008083540402835291602001916104a2565b820191906000526020600020905b81548152906001019060200180831161048557829003601f168201915b505050505081526020016002820180546104bb90612d54565b80601f01602080910402602001604051908101604052809291908181526020018280546104e790612d54565b80156105345780601f1061050957610100808354040283529160200191610534565b820191906000526020600020905b81548152906001019060200180831161051757829003601f168201915b5050505050815260200160038201805461054d90612d54565b80601f016020809104026020016040519081016040528092919081815260200182805461057990612d54565b80156105c65780601f1061059b576101008083540402835291602001916105c6565b820191906000526020600020905b8154815290600101906020018083116105a957829003601f168201915b505050505081526020016004820154815260200160058201548152602001600682015481526020016007820180546105fd90612d54565b80601f016020809104026020016040519081016040528092919081815260200182805461062990612d54565b80156106765780601f1061064b57610100808354040283529160200191610676565b820191906000526020600020905b81548152906001019060200180831161065957829003601f168201915b5050505050815260200160088201805461068f90612d54565b80601f01602080910402602001604051908101604052809291908181526020018280546106bb90612d54565b80156107085780601f106106dd57610100808354040283529160200191610708565b820191906000526020600020905b8154815290600101906020018083116106eb57829003601f168201915b505050505081525050905092915050565b60606103df60076114de565b600080600061077133878787808060200260200160405190810160405280939291908181526020018383602002808284376000920191909152505060015460049594939250905061189e565b6040519295509093509150339084156108fc029085906000818181858888f193505050501580156107a6573d6000803e3d6000fd5b5060408051838152602081018390526001600160a01b038816913391600080516020613102833981519152910160405180910390a3505050505050565b610899338b8b8b8b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050604080516020601f8f018190048102820181019092528d815292508d91508c908190840183828082843760009201919091525050604080516020601f8e018190048102820181019092528c815292508c91508b9081908401838280828437600092019190915250600798979695949392508b91508a9050611a60565b896040516108a79190612d8e565b6040518091039020336001600160a01b03167f95e1ef74a36b7d6ac766d338a4468c685d593739c3b7dc39e2aa5921a1e139328b8b8b8787428e8e8e8e6040516108fa9a99989796959493929190612dd3565b60405180910390a350505050505050505050565b610916611b52565b6109206000611bac565b565b61092a611b52565b600280546001600160a01b039092166001600160a01b0319928316811790915560038054909216179055565b6003546000906001600160a01b031663ad12259a6109748480612e46565b6109816020870187612e46565b87604001356040518663ffffffff1660e01b81526004016109a6959493929190612ec2565b602060405180830381865afa1580156109c3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109e79190612efc565b905080610a3c5760405163885e287960e01b815260206004820152601f60248201527f5a4b20736574746c656d656e742076616c69646174696f6e206661696c65640060448201526064015b60405180910390fd5b6000610a4b6020840184612e46565b808060200260200160405190810160405280939291908181526020018383602002808284376000920182905250939450339250839150505b610a906060870187612e46565b9050811015610efd576000610aa86060880188612e46565b83818110610ab857610ab8612f1e565b90506020020135905060008185610acf9190612f4a565b9050600080878781518110610ae657610ae6612f1e565b60200260200101519050600088886002610b009190612f4a565b81518110610b1057610b10612f1e565b60200260200101519050600089896003610b2a9190612f4a565b81518110610b3a57610b3a612f1e565b602002602001015190506000610b5c84336004611bfc9092919063ffffffff16565b90508a610b6a8b6005612f4a565b81518110610b7a57610b7a612f1e565b602002602001015181600501600060028110610b9857610b98612f1e565b0154141580610be157508a610bae8b6006612f4a565b81518110610bbe57610bbe612f1e565b602002602001015181600501600160028110610bdc57610bdc612f1e565b015414155b15610c2f5760405163885e287960e01b815260206004820152601760248201527f7369676e6572206b657920697320696e636f72726563740000000000000000006044820152606401610a33565b8281600201541115610c845760405163885e287960e01b815260206004820152601a60248201527f696e697469616c206e6f6e636520697320696e636f72726563740000000000006044820152606401610a33565b895b86811015610e865760008c8281518110610ca257610ca2612f1e565b6020026020010151905060008d836001610cbc9190612f4a565b81518110610ccc57610ccc612f1e565b602002602001015190508d836003610ce49190612f4a565b81518110610cf457610cf4612f1e565b6020026020010151945060008e846004610d0e9190612f4a565b81518110610d1e57610d1e612f1e565b6020026020010151905060008a856009610d389190612f4a565b10610d44576000610d69565b8f610d50866009612f4a565b81518110610d6057610d60612f1e565b60200260200101515b90508015801590610d7a5750808710155b15610dbb5760405163885e287960e01b815260206004820152601060248201526f1b9bdb98d9481bdd995c9b185c1c195960821b6044820152606401610a33565b8884141580610dca57508d8314155b15610e6257888403610e11576040518060400160405280601d81526020017f70726f7669646572206164647265737320697320696e636f7272656374000000815250610e48565b6040518060400160405280601981526020017f75736572206164647265737320697320696e636f7272656374000000000000008152505b60405163885e287960e01b8152600401610a339190612f5d565b610e6c828b612f4a565b995050505050600781610e7f9190612f4a565b9050610c86565b508481600301541015610ed35760405163885e287960e01b8152602060048201526014602482015273696e73756666696369656e742062616c616e636560601b6044820152606401610a33565b610edd8186611c09565b6002015550919550839250610ef59150829050612f70565b915050610a83565b5082518214610f6c5760405163885e287960e01b815260206004820152603460248201527f6172726179207365676d656e7453697a652073756d206d69736d617463686573604482015273040e0eac4d8d2c640d2dce0eae840d8cadccee8d60631b6064820152608401610a33565b5050505050565b600080610f84600433868634611e12565b60408051838152602081018390529294509092506001600160a01b038616913391600080516020613102833981519152910160405180910390a350505050565b6000610fd36004338585611e7b565b905080836001600160a01b0316336001600160a01b03167f54377dfdebf06f6df53fbda737d2dcd7e141f95bbfb0c1223437e856b9de3ac34260405161101b91815260200190565b60405180910390a4505050565b600054600160a01b900460ff161561108d5760405162461bcd60e51b815260206004820152602260248201527f496e697469616c697a61626c653a20616c726561647920696e697469616c697a604482015261195960f21b6064820152608401610a33565b6000805460ff60a01b1916600160a01b1790556110a981611bac565b50600191909155600280546001600160a01b039092166001600160a01b0319928316811790915560038054909216179055565b6000806110ec6004338534611f71565b60408051838152602081018390529294509092506001600160a01b038516913391600080516020613102833981519152910160405180910390a3505050565b611133611b52565b6001600160a01b0381166111985760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610a33565b6111a181611bac565b50565b6111b060073383611ffd565b806040516111be9190612d8e565b6040519081900381209033907f68026479739e3662c0651578523384b94455e79bfb701ce111a3164591ceba7390600090a350565b6111fb611b52565b600155565b611208612550565b61121460048484611bfc565b6040805160e08101825282546001600160a01b039081168252600184015416602082015260028084015482840152600384015460608301526004840154608083015282518084019384905291939260a085019291600585019182845b815481526020019060010190808311611270575050505050815260200160078201805480602002602001604051908101604052809291908181526020016000905b8282101561130a576000848152602090819020604080516080810182526004860290920180548352600180820154848601526002820154928401929092526003015460ff161515606083015290835290920191016112b1565b505050508152505090505b92915050565b6060600061132883612040565b90508067ffffffffffffffff811115611343576113436127ad565b60405190808252806020026020018201604052801561137c57816020015b611369612550565b8152602001906001900390816113615790505b50915060005b818110156114c257611394848261204b565b6040805160e08101825282546001600160a01b039081168252600184015416602082015260028084015482840152600384015460608301526004840154608083015282518084019384905291939260a085019291600585019182845b8154815260200190600101908083116113f0575050505050815260200160078201805480602002602001604051908101604052809291908181526020016000905b8282101561148a576000848152602090819020604080516080810182526004860290920180548352600180820154848601526002820154928401929092526003015460ff16151560608301529083529092019101611431565b50505050815250508382815181106114a4576114a4612f1e565b602002602001018190525080806114ba90612f70565b915050611382565b5050919050565b60006114d6848484612071565b949350505050565b606060006114eb83612040565b90508067ffffffffffffffff811115611506576115066127ad565b60405190808252806020026020018201604052801561153f57816020015b61152c6124fb565b8152602001906001900390816115245790505b50915060005b818110156114c257611557848261204b565b60408051610120810190915281546001600160a01b0316815260018201805491929160208401919061158890612d54565b80601f01602080910402602001604051908101604052809291908181526020018280546115b490612d54565b80156116015780601f106115d657610100808354040283529160200191611601565b820191906000526020600020905b8154815290600101906020018083116115e457829003601f168201915b5050505050815260200160028201805461161a90612d54565b80601f016020809104026020016040519081016040528092919081815260200182805461164690612d54565b80156116935780601f1061166857610100808354040283529160200191611693565b820191906000526020600020905b81548152906001019060200180831161167657829003601f168201915b505050505081526020016003820180546116ac90612d54565b80601f01602080910402602001604051908101604052809291908181526020018280546116d890612d54565b80156117255780601f106116fa57610100808354040283529160200191611725565b820191906000526020600020905b81548152906001019060200180831161170857829003601f168201915b5050505050815260200160048201548152602001600582015481526020016006820154815260200160078201805461175c90612d54565b80601f016020809104026020016040519081016040528092919081815260200182805461178890612d54565b80156117d55780601f106117aa576101008083540402835291602001916117d5565b820191906000526020600020905b8154815290600101906020018083116117b857829003601f168201915b505050505081526020016008820180546117ee90612d54565b80601f016020809104026020016040519081016040528092919081815260200182805461181a90612d54565b80156118675780601f1061183c57610100808354040283529160200191611867565b820191906000526020600020905b81548152906001019060200180831161184a57829003601f168201915b50505050508152505083828151811061188257611882612f1e565b60200260200101819052508061189790612f70565b9050611545565b6000806000806118af8989896120c5565b90506000935060005b8651811015611a455760008782815181106118d5576118d5612f1e565b602002602001015190508260070180549050811061192057604051637621e3f760e11b81526001600160a01b03808c1660048301528a16602482015260448101829052606401610a33565b600083600701828154811061193757611937612f1e565b60009182526020909120600490910201600381015490915060ff161561198a57604051633cf6bf4160e01b81526001600160a01b03808d1660048301528b16602482015260448101839052606401610a33565b87816002015461199a9190612f4a565b4210156119d457604051631779e03760e31b81526001600160a01b03808d1660048301528b16602482015260448101839052606401610a33565b80600101548460030160008282546119ec9190612f89565b90915550506001810154600485018054600090611a0a908490612f89565b909155505060038101805460ff19166001908117909155810154611a2e9088612f4a565b965050508080611a3d90612f70565b9150506118b8565b50806003015492508060040154915050955095509592505050565b6000611a6c898961211f565b9050611a788a82612152565b611ad657611acf8a826040518061012001604052808d6001600160a01b031681526020018c81526020018b81526020018a815260200187815260200186815260200142815260200189815260200188815250612165565b5050611b47565b6000611ae38b8b8b612071565b905060018101611af38a82612fea565b5060028101611b028982612fea565b50600481018490556005810183905560038101611b1f8882612fea565b5042600682015560078101611b348782612fea565b5060088101611b438682612fea565b5050505b505050505050505050565b6000546001600160a01b031633146109205760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610a33565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60006114d68484846120c5565b81600401548260030154611c1d9190612f89565b811115611d8257600082600401548360030154611c3a9190612f89565b611c449083612f89565b90508083600401541015611ca95760405163885e287960e01b815260206004820152602560248201527f696e73756666696369656e742062616c616e636520696e2070656e64696e675260448201526419599d5b9960da1b6064820152608401610a33565b80836004016000828254611cbd9190612f89565b90915550506007830154600090611cd690600190612f89565b90505b60008112611d7f576000846007018281548110611cf857611cf8612f1e565b60009182526020909120600490910201600381015490915060ff1615611d1e5750611d6d565b82816001015411611d3f576001810154611d389084612f89565b9250611d5d565b82816001016000828254611d539190612f89565b9091555060009350505b82600003611d6b5750611d7f565b505b80611d77816130aa565b915050611cd9565b50505b80826003016000828254611d969190612f89565b909155505081546003830154600484015460405133936001600160a01b03169260008051602061310283398151915292611dd892918252602082015260400190565b60405180910390a3604051339082156108fc029083906000818181858888f19350505050158015611e0d573d6000803e3d6000fd5b505050565b6000806000611e21878761222b565b9050611e2d8882612152565b15611e5e57604051632cf0675960e21b81526001600160a01b03808916600483015287166024820152604401610a33565b611e6c888289898989612253565b50919660009650945050505050565b600080611e898686866120c5565b90508281600401548260030154611ea09190612f89565b1015611ed257604051630a542ddd60e31b81526001600160a01b03808716600483015285166024820152604401610a33565b6040805160808101825260078301805480835260208084018881524295850195865260006060860181815260018086018755958252928120955160049485029096019586559051938501939093559351600284015592516003909201805460ff1916921515929092179091559082018054859290611f51908490612f4a565b90915550506007810154611f6790600190612f89565b9695505050505050565b6000806000611f80868661222b565b9050611f8c8782612152565b611fbc57604051637e01ed7f60e01b81526001600160a01b03808816600483015286166024820152604401610a33565b6000611fc98888886120c5565b905084816003016000828254611fdf9190612f4a565b90915550506003810154600490910154909890975095505050505050565b6000612009838361211f565b90506120158482612152565b61203657828260405163edefcd8360e01b8152600401610a339291906130c7565b610f6c84826122be565b600061131582612349565b6000806120588484612353565b6000908152600285016020526040902091505092915050565b60008061207e848461211f565b6000818152600287016020526040902090915061209b8683612152565b6120bc57848460405163edefcd8360e01b8152600401610a339291906130c7565b95945050505050565b6000806120d2848461222b565b600081815260028701602052604090209091506120ef8683612152565b6120bc57604051637e01ed7f60e01b81526001600160a01b03808716600483015285166024820152604401610a33565b600082826040516020016121349291906130c7565b60405160208183030381529060405280519060200120905092915050565b600061215e838361235f565b9392505050565b600082815260028401602090815260408220835181546001600160a01b0319166001600160a01b039091161781559083015183919060018201906121a99082612fea565b50604082015160028201906121be9082612fea565b50606082015160038201906121d39082612fea565b506080820151600482015560a0820151600582015560c0820151600682015560e082015160078201906122069082612fea565b50610100820151600882019061221c9082612fea565b506114d6915085905084612377565b604080516001600160a01b038085166020830152831691810191909152600090606001612134565b6000858152600280880160205260409091206003810183905580546001600160a01b038088166001600160a01b031992831617835560018301805491881691909216179055906122a990600583019085906125a5565b506122b48787612377565b5050505050505050565b6000818152600283016020526040812080546001600160a01b0319168155816122ea60018301826125e3565b6122f86002830160006125e3565b6123066003830160006125e3565b60048201600090556005820160009055600682016000905560078201600061232e91906125e3565b61233c6008830160006125e3565b5061215e90508383612383565b6000611315825490565b600061215e838361238f565b6000818152600183016020526040812054151561215e565b600061215e83836123b9565b600061215e8383612408565b60008260000182815481106123a6576123a6612f1e565b9060005260206000200154905092915050565b600081815260018301602052604081205461240057508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155611315565b506000611315565b600081815260018301602052604081205480156124f157600061242c600183612f89565b855490915060009061244090600190612f89565b90508181146124a557600086600001828154811061246057612460612f1e565b906000526020600020015490508087600001848154811061248357612483612f1e565b6000918252602080832090910192909255918252600188019052604090208390555b85548690806124b6576124b66130eb565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050611315565b6000915050611315565b60405180610120016040528060006001600160a01b0316815260200160608152602001606081526020016060815260200160008152602001600081526020016000815260200160608152602001606081525090565b6040518060e0016040528060006001600160a01b0316815260200160006001600160a01b0316815260200160008152602001600081526020016000815260200161259861261d565b8152602001606081525090565b82600281019282156125d3579160200282015b828111156125d35782358255916020019190600101906125b8565b506125df92915061263b565b5090565b5080546125ef90612d54565b6000825580601f106125ff575050565b601f0160209004906000526020600020908101906111a1919061263b565b60405180604001604052806002906020820280368337509192915050565b5b808211156125df576000815560010161263c565b600081518084526020808501945080840160005b838110156126a25781518051885283810151848901526040808201519089015260609081015115159088015260809096019590820190600101612664565b509495945050505050565b600061010060018060a01b0380845116855260208181860151168187015260408501516040870152606085015160608701526080850151608087015260a0850151915060a0860160005b6002811015612714578351825292820192908201906001016126f7565b5050505060c08301518160e08601526120bc82860182612650565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b8281101561278457603f198886030184526127728583516126ad565b94509285019290850190600101612756565b5092979650505050505050565b80356001600160a01b03811681146127a857600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126127d457600080fd5b813567ffffffffffffffff808211156127ef576127ef6127ad565b604051601f8301601f19908116603f01168101908282118183101715612817576128176127ad565b8160405283815286602085880101111561283057600080fd5b836020870160208301376000602085830101528094505050505092915050565b6000806040838503121561286357600080fd5b61286c83612791565b9150602083013567ffffffffffffffff81111561288857600080fd5b612894858286016127c3565b9150509250929050565b60005b838110156128b95781810151838201526020016128a1565b50506000910152565b600081518084526128da81602086016020860161289e565b601f01601f19169290920160200192915050565b80516001600160a01b0316825260006101206020830151816020860152612917828601826128c2565b9150506040830151848203604086015261293182826128c2565b9150506060830151848203606086015261294b82826128c2565b9150506080830151608085015260a083015160a085015260c083015160c085015260e083015184820360e086015261298382826128c2565b9150506101008084015185830382870152611f6783826128c2565b60208152600061215e60208301846128ee565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b8281101561278457603f198886030184526129f48583516128ee565b945092850192908501906001016129d8565b600080600060408486031215612a1b57600080fd5b612a2484612791565b9250602084013567ffffffffffffffff80821115612a4157600080fd5b818601915086601f830112612a5557600080fd5b813581811115612a6457600080fd5b8760208260051b8501011115612a7957600080fd5b6020830194508093505050509250925092565b60008083601f840112612a9e57600080fd5b50813567ffffffffffffffff811115612ab657600080fd5b602083019150836020828501011115612ace57600080fd5b9250929050565b60008060008060008060008060008060e08b8d031215612af457600080fd5b8a3567ffffffffffffffff80821115612b0c57600080fd5b612b188e838f016127c3565b9b5060208d0135915080821115612b2e57600080fd5b612b3a8e838f016127c3565b9a5060408d0135915080821115612b5057600080fd5b612b5c8e838f01612a8c565b909a50985060608d0135915080821115612b7557600080fd5b612b818e838f01612a8c565b909850965060808d0135915080821115612b9a57600080fd5b50612ba78d828e01612a8c565b9b9e9a9d50989b979a969995989760a08101359660c09091013595509350505050565b600060208284031215612bdc57600080fd5b61215e82612791565b600060208284031215612bf757600080fd5b813567ffffffffffffffff811115612c0e57600080fd5b82016080818503121561215e57600080fd5b60008060608385031215612c3357600080fd5b612c3c83612791565b915083606084011115612c4e57600080fd5b50926020919091019150565b60008060408385031215612c6d57600080fd5b612c7683612791565b946020939093013593505050565b600080600060608486031215612c9957600080fd5b83359250612ca960208501612791565b9150612cb760408501612791565b90509250925092565b600060208284031215612cd257600080fd5b813567ffffffffffffffff811115612ce957600080fd5b6114d6848285016127c3565b600060208284031215612d0757600080fd5b5035919050565b60008060408385031215612d2157600080fd5b612d2a83612791565b9150612d3860208401612791565b90509250929050565b60208152600061215e60208301846126ad565b600181811c90821680612d6857607f821691505b602082108103612d8857634e487b7160e01b600052602260045260246000fd5b50919050565b60008251612da081846020870161289e565b9190910192915050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b60e081526000612de660e083018d6128c2565b8281036020840152612df9818c8e612daa565b905089604084015288606084015287608084015282810360a0840152612e20818789612daa565b905082810360c0840152612e35818587612daa565b9d9c50505050505050505050505050565b6000808335601e19843603018112612e5d57600080fd5b83018035915067ffffffffffffffff821115612e7857600080fd5b6020019150600581901b3603821315612ace57600080fd5b81835260006001600160fb1b03831115612ea957600080fd5b8260051b80836020870137939093016020019392505050565b606081526000612ed6606083018789612e90565b8281036020840152612ee9818688612e90565b9150508260408301529695505050505050565b600060208284031215612f0e57600080fd5b8151801515811461215e57600080fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b8082018082111561131557611315612f34565b60208152600061215e60208301846128c2565b600060018201612f8257612f82612f34565b5060010190565b8181038181111561131557611315612f34565b601f821115611e0d57600081815260208120601f850160051c81016020861015612fc35750805b601f850160051c820191505b81811015612fe257828155600101612fcf565b505050505050565b815167ffffffffffffffff811115613004576130046127ad565b613018816130128454612d54565b84612f9c565b602080601f83116001811461304d57600084156130355750858301515b600019600386901b1c1916600185901b178555612fe2565b600085815260208120601f198616915b8281101561307c5788860151825594840194600190910190840161305d565b508582101561309a5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000600160ff1b82016130bf576130bf612f34565b506000190190565b6001600160a01b03831681526040602082018190526000906114d6908301846128c2565b634e487b7160e01b600052603160045260246000fdfe526824944047da5b81071fb6349412005c5da81380b336103fbe5dd34556c776a26469706673582212205173a5ae1cd26cb90b86f04d9d7dde48a76cfebed9b27c14f85698c70a6b613964736f6c63430008140033";
var isSuperArgs = function (xs) { return xs.length > 1; };
var Serving__factory = /** @class */ (function (_super) {
    __extends(Serving__factory, _super);
    function Serving__factory() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var _this = this;
        if (isSuperArgs(args)) {
            _this = _super.apply(this, args) || this;
        }
        else {
            _this = _super.call(this, _abi, _bytecode, args[0]) || this;
        }
        return _this;
    }
    Serving__factory.prototype.getDeployTransaction = function (overrides) {
        return _super.prototype.getDeployTransaction.call(this, overrides || {});
    };
    Serving__factory.prototype.deploy = function (overrides) {
        return _super.prototype.deploy.call(this, overrides || {});
    };
    Serving__factory.prototype.connect = function (runner) {
        return _super.prototype.connect.call(this, runner);
    };
    Serving__factory.createInterface = function () {
        return new Interface(_abi);
    };
    Serving__factory.connect = function (address, runner) {
        return new Contract(address, _abi, runner);
    };
    Serving__factory.bytecode = _bytecode;
    Serving__factory.abi = _abi;
    return Serving__factory;
}(ContractFactory));

var ServingContract = /** @class */ (function () {
    function ServingContract(signer, contractAddress, userAddress) {
        this.serving = Serving__factory.connect(contractAddress, signer);
        this._userAddress = userAddress;
    }
    ServingContract.prototype.lockTime = function () {
        return this.serving.lockTime();
    };
    ServingContract.prototype.listService = function () {
        return __awaiter(this, void 0, void 0, function () {
            var services, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.serving.getAllServices()];
                    case 1:
                        services = _a.sent();
                        return [2 /*return*/, services];
                    case 2:
                        error_1 = _a.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ServingContract.prototype.listAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accounts, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.serving.getAllAccounts()];
                    case 1:
                        accounts = _a.sent();
                        return [2 /*return*/, accounts];
                    case 2:
                        error_2 = _a.sent();
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ServingContract.prototype.getAccount = function (user, provider) {
        return __awaiter(this, void 0, void 0, function () {
            var account, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.serving.getAccount(user, provider)];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, account];
                    case 2:
                        error_3 = _a.sent();
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ServingContract.prototype.addOrUpdateService = function (name, serviceType, url, model, verifiability, inputPrice, outputPrice) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, receipt, error, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.serving.addOrUpdateService(name, serviceType, url, model, verifiability, inputPrice, outputPrice)];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        receipt = _a.sent();
                        if (!receipt || receipt.status !== 1) {
                            error = new Error('Transaction failed');
                            throw error;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_4 = _a.sent();
                        throw error_4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ServingContract.prototype.addAccount = function (providerAddress, signer, balance) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, receipt, error, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.serving.addAccount(providerAddress, signer, {
                                value: BigInt(balance),
                            })];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        receipt = _a.sent();
                        if (!receipt || receipt.status !== 1) {
                            error = new Error('Transaction failed');
                            throw error;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_5 = _a.sent();
                        throw error_5;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ServingContract.prototype.depositFund = function (providerAddress, balance) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, receipt, error, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.serving.depositFund(providerAddress, {
                                value: balance,
                            })];
                    case 1:
                        tx = _a.sent();
                        console.log('tx', tx);
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        receipt = _a.sent();
                        console.log('receipt', receipt);
                        if (!receipt || receipt.status !== 1) {
                            error = new Error('Transaction failed');
                            throw error;
                        }
                        return [3 /*break*/, 4];
                    case 3:
                        error_6 = _a.sent();
                        throw error_6;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ServingContract.prototype.getService = function (providerAddress, svcName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    return [2 /*return*/, this.serving.getService(providerAddress, svcName)];
                }
                catch (error) {
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ServingContract.prototype.getUserAddress = function () {
        return this._userAddress;
    };
    return ServingContract;
}());

var REQUEST_LENGTH = 40;

/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
var RequestProcessor = /** @class */ (function (_super) {
    __extends(RequestProcessor, _super);
    function RequestProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    RequestProcessor.prototype.processRequest = function (providerAddress, svcName, content, settlementKey) {
        return __awaiter(this, void 0, void 0, function () {
            var extractor, sig, _a, nonce, outputFee, zkPrivateKey, updatedNonce, key, _b, fee, inputFee, zkInput, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, this.getExtractor(providerAddress, svcName)];
                    case 1:
                        extractor = _c.sent();
                        return [4 /*yield*/, this.getProviderData(providerAddress)];
                    case 2:
                        _a = _c.sent(), nonce = _a.nonce, outputFee = _a.outputFee, zkPrivateKey = _a.zkPrivateKey;
                        if (settlementKey) {
                            zkPrivateKey = JSON.parse(settlementKey).map(function (num) {
                                return BigInt(num);
                            });
                        }
                        if (!zkPrivateKey) {
                            throw new Error('Miss private key for signing request');
                        }
                        updatedNonce = !nonce ? 1 : nonce + REQUEST_LENGTH;
                        key = this.contract.getUserAddress() + providerAddress;
                        this.metadata.storeNonce(key, updatedNonce);
                        return [4 /*yield*/, this.calculateFees(extractor, content, outputFee)
                            // const zkInput = new Request(
                            //     updatedNonce.toString(),
                            //     fee.toString(),
                            //     this.contract.getUserAddress(),
                            //     providerAddress
                            // )
                        ];
                    case 3:
                        _b = _c.sent(), fee = _b.fee, inputFee = _b.inputFee;
                        zkInput = {
                            nonce: updatedNonce,
                            fee: fee,
                            userAddress: this.contract.getUserAddress(),
                            providerAddress: providerAddress,
                        };
                        return [4 /*yield*/, sign()];
                    case 4:
                        sig = _c.sent();
                        return [2 /*return*/, {
                                'X-Phala-Signature-Type': 'StandaloneApi',
                                Address: this.contract.getUserAddress(),
                                Fee: zkInput.fee.toString(),
                                'Input-Fee': inputFee.toString(),
                                Nonce: zkInput.nonce.toString(),
                                'Previous-Output-Fee': (outputFee !== null && outputFee !== void 0 ? outputFee : 0).toString(),
                                'Service-Name': svcName,
                                Signature: sig,
                            }];
                    case 5:
                        error_1 = _c.sent();
                        throw error_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    RequestProcessor.prototype.calculateFees = function (extractor, content, outputFee) {
        return __awaiter(this, void 0, void 0, function () {
            var svc, inputCount, inputFee, fee;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, extractor.getSvcInfo()];
                    case 1:
                        svc = _a.sent();
                        return [4 /*yield*/, extractor.getInputCount(content)];
                    case 2:
                        inputCount = _a.sent();
                        inputFee = inputCount * Number(svc.inputPrice);
                        fee = inputFee + (outputFee !== null && outputFee !== void 0 ? outputFee : 0);
                        return [2 /*return*/, { fee: fee, inputFee: inputFee }];
                }
            });
        });
    };
    return RequestProcessor;
}(ZGServingUserBrokerBase));

var VerifiabilityEnum;
(function (VerifiabilityEnum) {
    VerifiabilityEnum["OpML"] = "OpML";
    VerifiabilityEnum["TeeML"] = "TeeML";
    VerifiabilityEnum["ZKML"] = "ZKML";
})(VerifiabilityEnum || (VerifiabilityEnum = {}));
var ModelProcessor = /** @class */ (function (_super) {
    __extends(ModelProcessor, _super);
    function ModelProcessor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ModelProcessor.prototype.listService = function () {
        return __awaiter(this, void 0, void 0, function () {
            var services, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.contract.listService()];
                    case 1:
                        services = _a.sent();
                        return [2 /*return*/, services];
                    case 2:
                        error_1 = _a.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return ModelProcessor;
}(ZGServingUserBrokerBase));
function isVerifiability(value) {
    return Object.values(VerifiabilityEnum).includes(value);
}

/**
 * The Verifier class contains methods for verifying service reliability.
 */
var Verifier = /** @class */ (function (_super) {
    __extends(Verifier, _super);
    function Verifier() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Verifier.prototype.verifyService = function (providerAddress, svcName) {
        return __awaiter(this, void 0, void 0, function () {
            var valid, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getSigningAddress(providerAddress, svcName, true)];
                    case 1:
                        valid = (_a.sent()).valid;
                        return [2 /*return*/, valid];
                    case 2:
                        error_1 = _a.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * getSigningAddress verifies whether the signing address
     * of the signer corresponds to a valid RA.
     *
     * It also stores the signing address of the RA in
     * localStorage and returns it.
     *
     * @param providerAddress - provider address.
     * @param svcName - service name.
     * @param verifyRA - whether to verify the RA， default is false.
     * @returns The first return value indicates whether the RA is valid,
     * and the second return value indicates the signing address of the RA.
     */
    Verifier.prototype.getSigningAddress = function (providerAddress_1, svcName_1) {
        return __awaiter(this, arguments, void 0, function (providerAddress, svcName, verifyRA) {
            var key, signingKey, extractor, svc, signerRA, valid, error_2;
            if (verifyRA === void 0) { verifyRA = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        key = "".concat(this.contract.getUserAddress(), "_").concat(providerAddress, "_").concat(svcName);
                        return [4 /*yield*/, this.metadata.getSigningKey(key)];
                    case 1:
                        signingKey = _a.sent();
                        if (!verifyRA && signingKey) {
                            return [2 /*return*/, {
                                    valid: null,
                                    signingAddress: signingKey,
                                }];
                        }
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 9]);
                        return [4 /*yield*/, this.getExtractor(providerAddress, svcName, false)];
                    case 3:
                        extractor = _a.sent();
                        return [4 /*yield*/, extractor.getSvcInfo()];
                    case 4:
                        svc = _a.sent();
                        return [4 /*yield*/, Verifier.fetSignerRA(svc.url, svc.name)];
                    case 5:
                        signerRA = _a.sent();
                        if (!(signerRA === null || signerRA === void 0 ? void 0 : signerRA.signing_address)) {
                            throw new Error('signing address does not exist');
                        }
                        signingKey = "".concat(this.contract.getUserAddress(), "_").concat(providerAddress, "_").concat(svcName);
                        return [4 /*yield*/, this.metadata.storeSigningKey(signingKey, signerRA.signing_address)
                            // TODO: use intel_quote to verify signing address
                        ];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, Verifier.verifyRA(signerRA.nvidia_payload)];
                    case 7:
                        valid = _a.sent();
                        return [2 /*return*/, {
                                valid: valid,
                                signingAddress: signerRA.signing_address,
                            }];
                    case 8:
                        error_2 = _a.sent();
                        throw error_2;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    Verifier.prototype.getSignerRaDownloadLink = function (providerAddress, svcName) {
        return __awaiter(this, void 0, void 0, function () {
            var svc, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getService(providerAddress, svcName)];
                    case 1:
                        svc = _a.sent();
                        return [2 /*return*/, "".concat(svc.url, "/v1/proxy/").concat(svcName, "/attestation/report")];
                    case 2:
                        error_3 = _a.sent();
                        if (error_3 instanceof Error) {
                            console.error(error_3 === null || error_3 === void 0 ? void 0 : error_3.message);
                        }
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Verifier.prototype.getChatSignatureDownloadLink = function (providerAddress, svcName, chatID) {
        return __awaiter(this, void 0, void 0, function () {
            var svc, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.getService(providerAddress, svcName)];
                    case 1:
                        svc = _a.sent();
                        return [2 /*return*/, "".concat(svc.url, "/v1/proxy/").concat(svcName, "/signature/").concat(chatID)];
                    case 2:
                        error_4 = _a.sent();
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    // TODO: add test
    Verifier.verifyRA = function (nvidia_payload) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fetch('https://nras.attestation.nvidia.com/v3/attest/gpu', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                        },
                        body: JSON.stringify(nvidia_payload),
                    })
                        .then(function (response) {
                        if (response.status === 200) {
                            return true;
                        }
                        if (response.status === 404) {
                            throw new Error('verify RA error: 404');
                        }
                        else {
                            return false;
                        }
                    })
                        .catch(function (error) {
                        if (error instanceof Error) {
                            console.error(error.message);
                        }
                        return false;
                    })];
            });
        });
    };
    Verifier.fetSignerRA = function (providerBrokerURL, svcName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fetch("".concat(providerBrokerURL, "/v1/proxy/").concat(svcName, "/attestation/report"), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(function (response) {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                        .then(function (data) {
                        if (data.nvidia_payload) {
                            try {
                                data.nvidia_payload = JSON.parse(data.nvidia_payload);
                            }
                            catch (error) {
                                throw error;
                            }
                        }
                        if (data.intel_quote) {
                            try {
                                var intel_quota = JSON.parse(data.intel_quote);
                                data.intel_quote =
                                    '0x' +
                                        Buffer.from(intel_quota, 'base64').toString('hex');
                            }
                            catch (error) {
                                throw error;
                            }
                        }
                        return data;
                    })
                        .catch(function (error) {
                        throw error;
                    })];
            });
        });
    };
    Verifier.fetSignatureByChatID = function (providerBrokerURL, svcName, chatID) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, fetch("".concat(providerBrokerURL, "/v1/proxy/").concat(svcName, "/signature/").concat(chatID), {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    })
                        .then(function (response) {
                        if (!response.ok) {
                            throw new Error('getting signature error');
                        }
                        return response.json();
                    })
                        .then(function (data) {
                        return data;
                    })
                        .catch(function (error) {
                        throw error;
                    })];
            });
        });
    };
    Verifier.verifySignature = function (message, signature, expectedAddress) {
        var messageHash = ethers.hashMessage(message);
        var recoveredAddress = ethers.recoverAddress(messageHash, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    };
    return Verifier;
}(ZGServingUserBrokerBase));

/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
var ResponseProcessor = /** @class */ (function (_super) {
    __extends(ResponseProcessor, _super);
    function ResponseProcessor(contract, metadata, cache) {
        var _this = _super.call(this, contract, metadata, cache) || this;
        _this.contract = contract;
        _this.metadata = metadata;
        _this.verifier = new Verifier(contract, metadata, cache);
        return _this;
    }
    ResponseProcessor.prototype.processResponse = function (providerAddress, svcName, content, chatID) {
        return __awaiter(this, void 0, void 0, function () {
            var extractor, outputFee, svc, singerRAVerificationResult, ResponseSignature, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 8, , 9]);
                        extractor = void 0;
                        return [4 /*yield*/, this.getExtractor(providerAddress, svcName)];
                    case 1:
                        extractor = _a.sent();
                        return [4 /*yield*/, this.calculateOutputFees(extractor, content)];
                    case 2:
                        outputFee = _a.sent();
                        this.metadata.storeOutputFee("".concat(this.contract.getUserAddress(), "_").concat(providerAddress), outputFee);
                        return [4 /*yield*/, extractor.getSvcInfo()
                            // TODO: Temporarily return true for non-TeeML verifiability.
                            // these cases will be handled in the future.
                        ];
                    case 3:
                        svc = _a.sent();
                        // TODO: Temporarily return true for non-TeeML verifiability.
                        // these cases will be handled in the future.
                        if (isVerifiability(svc.verifiability) ||
                            svc.verifiability !== VerifiabilityEnum.TeeML) {
                            return [2 /*return*/, true];
                        }
                        if (!chatID) {
                            throw new Error('Chat ID does not exist');
                        }
                        return [4 /*yield*/, this.verifier.getSigningAddress(providerAddress, svcName)];
                    case 4:
                        singerRAVerificationResult = _a.sent();
                        if (!!singerRAVerificationResult.valid) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.verifier.getSigningAddress(providerAddress, svcName, true)];
                    case 5:
                        singerRAVerificationResult =
                            _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!singerRAVerificationResult.valid) {
                            throw new Error('Signing address is invalid');
                        }
                        return [4 /*yield*/, Verifier.fetSignatureByChatID(svc.url, svcName, chatID)];
                    case 7:
                        ResponseSignature = _a.sent();
                        return [2 /*return*/, Verifier.verifySignature(ResponseSignature.text, "0x".concat(ResponseSignature.signature), singerRAVerificationResult.signingAddress)];
                    case 8:
                        error_1 = _a.sent();
                        throw error_1;
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ResponseProcessor.prototype.calculateOutputFees = function (extractor, content) {
        return __awaiter(this, void 0, void 0, function () {
            var svc, outputCount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, extractor.getSvcInfo()];
                    case 1:
                        svc = _a.sent();
                        return [4 /*yield*/, extractor.getOutputCount(content)];
                    case 2:
                        outputCount = _a.sent();
                        return [2 /*return*/, outputCount * Number(svc.outputPrice)];
                }
            });
        });
    };
    return ResponseProcessor;
}(ZGServingUserBrokerBase));

var ZGServingNetworkBroker = /** @class */ (function () {
    function ZGServingNetworkBroker(signer, customPath, contractAddress) {
        var _this = this;
        /**
         * Retrieves a list of services from the contract.
         *
         * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
         * @throws An error if the service list cannot be retrieved.
         */
        this.listService = function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.modelProcessor.listService()];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_1 = _a.sent();
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Adds a new account to the contract.
         *
         * This function performs the following steps:
         * 1. Creates and stores a key pair for the given provider address.
         * 2. Adds the account to the contract using the provider address, the generated public pair, and the specified balance.
         *
         * @param providerAddress - The address of the provider for whom the account is being created.
         * @param balance - The initial balance to be assigned to the new account.
         *
         * @throws  An error if the account creation fails.
         *
         * @remarks
         * When creating an account, a key pair is also created to sign the request.
         */
        this.addAccount = function (account, balance) { return __awaiter(_this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.accountProcessor.addAccount(account, balance)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_2 = _a.sent();
                        throw error_2;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * Deposits a specified amount of funds into the given account.
         *
         * @param {string} account - The account identifier where the funds will be deposited.
         * @param {string} amount - The amount of funds to be deposited.
         * @throws  An error if the deposit fails.
         */
        this.depositFund = function (account, amount) { return __awaiter(_this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.accountProcessor.depositFund(account, amount)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_3 = _a.sent();
                        throw error_3;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * processRequest generates billing-related headers for the request
         * when the user uses the provider service.
         *
         * In the 0G Serving system, a request with valid billing headers
         * is considered a settlement proof and will be used by the provider
         * for contract settlement.
         *
         * @param providerAddress - The address of the provider.
         * @param svcName - The name of the service.
         * @param content - The content being billed. For example, in a chatbot service, it is the text input by the user.
         * @returns headers. Records information such as the request fee and user signature.
         * @throws An error if errors occur during the processing of the request.
         */
        this.processRequest = function (providerAddress, svcName, content, settlementKey) { return __awaiter(_this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.requestProcessor.processRequest(providerAddress, svcName, content, settlementKey)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_4 = _a.sent();
                        throw error_4;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * processResponse is used after the user successfully obtains a response from the provider service.
         *
         * processResponse extracts necessary information from the response and records it
         * in localStorage for generating billing headers for subsequent requests.
         *
         * Additionally, if the service is verifiable, input the chat ID from the response and
         * processResponse will determine the validity of the returned content by checking the
         * provider service's response and corresponding signature corresponding to the chat ID.
         *
         * @param providerAddress - The address of the provider.
         * @param svcName - The name of the service.
         * @param content - The main content returned by the service. For example, in the case of a chatbot service,
         * it would be the response text.
         * @param chatID - Only for verifiable service. You can fill in the chat ID obtained from response to
         * automatically download the response signature. The function will verify the reliability of the response
         * using the service's signing address.
         * @returns A boolean value. True indicates the returned content is valid, otherwise it is invalid.
         * @throws An error if errors occur during the processing of the response.
         */
        this.processResponse = function (providerAddress, svcName, content, chatID) { return __awaiter(_this, void 0, void 0, function () {
            var error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.responseProcessor.processResponse(providerAddress, svcName, content, chatID)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_5 = _a.sent();
                        throw error_5;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * verifyService is used to verify the reliability of the service.
         *
         * @param providerAddress - The address of the provider.
         * @param svcName - The name of the service.
         * @returns A <boolean | null> value. True indicates the service is reliable, otherwise it is unreliable.
         * @throws An error if errors occur during the verification process.
         */
        this.verifyService = function (providerAddress, svcName) { return __awaiter(_this, void 0, void 0, function () {
            var error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.verifier.verifyService(providerAddress, svcName)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_6 = _a.sent();
                        throw error_6;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * getSignerRaDownloadLink returns the download link for the Signer RA.
         *
         * It can be provided to users who wish to manually verify the Signer RA.
         *
         * @param providerAddress - provider address.
         * @param svcName - service name.
         * @returns Download link.
         */
        this.getSignerRaDownloadLink = function (providerAddress, svcName) { return __awaiter(_this, void 0, void 0, function () {
            var error_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.verifier.getSignerRaDownloadLink(providerAddress, svcName)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_7 = _a.sent();
                        throw error_7;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        /**
         * getChatSignatureDownloadLink returns the download link for the signature of a single chat.
         *
         * It can be provided to users who wish to manually verify the content of a single chat.
         *
         * @param providerAddress - provider address.
         * @param svcName - service name.
         * @param chatID - ID of the chat.
         *
         * @description To verify the chat signature, use the following code:
         *
         * ```typescript
         * const messageHash = ethers.hashMessage(messageToBeVerified)
         * const recoveredAddress = ethers.recoverAddress(messageHash, signature)
         * const isValid = recoveredAddress.toLowerCase() === signingAddress.toLowerCase()
         * ```
         *
         * @returns Download link.
         */
        this.getChatSignatureDownloadLink = function (providerAddress, svcName, chatID) { return __awaiter(_this, void 0, void 0, function () {
            var error_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.verifier.getChatSignatureDownloadLink(providerAddress, svcName, chatID)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        error_8 = _a.sent();
                        throw error_8;
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        this.signer = signer;
        this.customPath = customPath;
        this.contractAddress = contractAddress;
    }
    ZGServingNetworkBroker.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var userAddress, error_9, contract, metadata, cache;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 1:
                        userAddress = _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_9 = _a.sent();
                        throw error_9;
                    case 3:
                        contract = new ServingContract(this.signer, this.contractAddress, userAddress);
                        metadata = new Metadata(this.customPath);
                        cache = new Cache(this.customPath);
                        this.requestProcessor = new RequestProcessor(contract, metadata, cache);
                        this.responseProcessor = new ResponseProcessor(contract, metadata, cache);
                        this.accountProcessor = new AccountProcessor(contract, metadata, cache);
                        this.modelProcessor = new ModelProcessor(contract, metadata, cache);
                        this.verifier = new Verifier(contract, metadata, cache);
                        return [2 /*return*/];
                }
            });
        });
    };
    return ZGServingNetworkBroker;
}());
/**
 * createZGServingNetworkBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 * @returns broker instance.
 * @throws An error if the broker cannot be initialized.
 */
function createZGServingNetworkBroker(signer_1, customPath_1) {
    return __awaiter(this, arguments, void 0, function (signer, customPath, contractAddress) {
        var broker, error_10;
        if (contractAddress === void 0) { contractAddress = '0x9Ae9b2C822beFF4B4466075006bc6b5ac35E779F'; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    broker = new ZGServingNetworkBroker(signer, customPath, contractAddress);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, broker.initialize()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, broker];
                case 3:
                    error_10 = _a.sent();
                    throw error_10;
                case 4: return [2 /*return*/];
            }
        });
    });
}

export { AccountProcessor, ModelProcessor, RequestProcessor, ResponseProcessor, Verifier, ZGServingNetworkBroker, createZGServingNetworkBroker };
//# sourceMappingURL=index.mjs.map
