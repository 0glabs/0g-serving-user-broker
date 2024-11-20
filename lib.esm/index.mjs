import { buildBabyjub, buildEddsa } from 'circomlibjs';
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

var eddsa;
var babyjubjub;
function initBabyJub() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!babyjubjub) return [3 /*break*/, 2];
                    return [4 /*yield*/, buildBabyjub()];
                case 1:
                    babyjubjub = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function initEddsa() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!eddsa) return [3 /*break*/, 2];
                    return [4 /*yield*/, buildEddsa()];
                case 1:
                    eddsa = _a.sent();
                    _a.label = 2;
                case 2: return [2 /*return*/];
            }
        });
    });
}
function babyJubJubGeneratePrivateKey() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initBabyJub()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, babyjubjub.F.random()];
            }
        });
    });
}
function babyJubJubGeneratePublicKey(privateKey) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initEddsa()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, eddsa.prv2pub(privateKey)];
            }
        });
    });
}
function babyJubJubSignature(msg, privateKey) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initEddsa()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, eddsa.signPedersen(privateKey, msg)];
            }
        });
    });
}
function packSignature(signature) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initEddsa()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, eddsa.packSignature(signature)];
            }
        });
    });
}
function packPoint(point) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, initBabyJub()];
                case 1:
                    _a.sent();
                    return [2 /*return*/, babyjubjub.packPoint(point)];
            }
        });
    });
}

var BYTE_SIZE = 8;
function bigintToBytes(bigint, length) {
    var bytes = new Uint8Array(length);
    for (var i = 0; i < length; i++) {
        bytes[i] = Number((bigint >> BigInt(BYTE_SIZE * i)) & BigInt(0xff));
    }
    return bytes;
}
function bytesToBigint(bytes) {
    var bigint = BigInt(0);
    for (var i = 0; i < bytes.length; i++) {
        bigint += BigInt(bytes[i]) << BigInt(BYTE_SIZE * i);
    }
    return bigint;
}

var ADDR_LENGTH = 20;
var NONCE_LENGTH = 4;
var FEE_LENGTH = 8;
var Request = /** @class */ (function () {
    function Request(nonce, fee, userAddress, // hexstring format with '0x' prefix
    providerAddress // hexstring format with '0x' prefix
    ) {
        this.nonce = parseInt(nonce.toString());
        this.fee = BigInt(parseInt(fee.toString()));
        this.userAddress = BigInt(userAddress);
        this.providerAddress = BigInt(providerAddress);
    }
    Request.prototype.serialize = function () {
        var buffer = new ArrayBuffer(NONCE_LENGTH + ADDR_LENGTH * 2 + FEE_LENGTH);
        var view = new DataView(buffer);
        var offset = 0;
        // write nonce (u32)
        view.setUint32(offset, this.nonce, true);
        offset += NONCE_LENGTH;
        // write fee (u64)
        var feeBytes = bigintToBytes(this.fee, FEE_LENGTH);
        new Uint8Array(buffer, offset, FEE_LENGTH).set(feeBytes);
        offset += FEE_LENGTH;
        // write userAddress (u160)
        var userAddressBytes = bigintToBytes(this.userAddress, ADDR_LENGTH);
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(userAddressBytes);
        offset += ADDR_LENGTH;
        // write providerAddress (u160)
        var providerAddressBytes = bigintToBytes(this.providerAddress, ADDR_LENGTH);
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(providerAddressBytes);
        offset += ADDR_LENGTH;
        return new Uint8Array(buffer);
    };
    Request.deserialize = function (byteArray) {
        var expectedLength = NONCE_LENGTH + ADDR_LENGTH * 2 + FEE_LENGTH;
        if (byteArray.length !== expectedLength) {
            throw new Error("Invalid byte array length for deserialization. Expected: ".concat(expectedLength, ", but got: ").concat(byteArray.length));
        }
        var view = new DataView(byteArray.buffer);
        var offset = 0;
        // read nonce (u32)
        var nonce = view.getUint32(offset, true);
        offset += NONCE_LENGTH;
        // read fee (u64)
        var fee = bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + FEE_LENGTH)));
        offset += FEE_LENGTH;
        // read userAddress (u160)
        var userAddress = bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH)));
        offset += ADDR_LENGTH;
        // read providerAddress (u160)
        var providerAddress = bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH)));
        offset += ADDR_LENGTH;
        return new Request(nonce.toString(), fee.toString(), '0x' + userAddress.toString(16), '0x' + providerAddress.toString(16));
    };
    // Getters
    Request.prototype.getNonce = function () {
        return this.nonce;
    };
    Request.prototype.getFee = function () {
        return this.fee;
    };
    Request.prototype.getUserAddress = function () {
        return this.userAddress;
    };
    Request.prototype.getProviderAddress = function () {
        return this.providerAddress;
    };
    return Request;
}());

var FIELD_SIZE = 32;
function signRequests(requests, privateKey) {
    return __awaiter(this, void 0, void 0, function () {
        var serializedRequestTrace, signatures, i, signature, _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    serializedRequestTrace = requests.map(function (request) {
                        return request.serialize();
                    });
                    signatures = [];
                    i = 0;
                    _c.label = 1;
                case 1:
                    if (!(i < serializedRequestTrace.length)) return [3 /*break*/, 5];
                    return [4 /*yield*/, babyJubJubSignature(serializedRequestTrace[i], privateKey)];
                case 2:
                    signature = _c.sent();
                    _b = (_a = signatures).push;
                    return [4 /*yield*/, packSignature(signature)];
                case 3:
                    _b.apply(_a, [_c.sent()]);
                    _c.label = 4;
                case 4:
                    i++;
                    return [3 /*break*/, 1];
                case 5: return [2 /*return*/, signatures];
            }
        });
    });
}

var BIGINT_SIZE = 16;
function genKeyPair() {
    return __awaiter(this, void 0, void 0, function () {
        var privkey, pubkey, packedPubkey, packedPubkey0, packedPubkey1, packPrivkey0, packPrivkey1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, babyJubJubGeneratePrivateKey()
                    // generate public key
                ];
                case 1:
                    privkey = _a.sent();
                    return [4 /*yield*/, babyJubJubGeneratePublicKey(privkey)
                        // pack public key to FIELD_SIZE bytes
                    ];
                case 2:
                    pubkey = _a.sent();
                    return [4 /*yield*/, packPoint(pubkey)
                        // unpack packed pubkey to bigint
                    ];
                case 3:
                    packedPubkey = _a.sent();
                    packedPubkey0 = bytesToBigint(packedPubkey.slice(0, BIGINT_SIZE));
                    packedPubkey1 = bytesToBigint(packedPubkey.slice(BIGINT_SIZE));
                    packPrivkey0 = bytesToBigint(privkey.slice(0, BIGINT_SIZE));
                    packPrivkey1 = bytesToBigint(privkey.slice(BIGINT_SIZE));
                    return [2 /*return*/, {
                            packedPrivkey: [packPrivkey0, packPrivkey1],
                            doublePackedPubkey: [packedPubkey0, packedPubkey1],
                        }];
            }
        });
    });
}
function signData(data, packedPrivkey) {
    return __awaiter(this, void 0, void 0, function () {
        var packedPrivkey0, packedPrivkey1, privateKey, signatures;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    packedPrivkey0 = bigintToBytes(packedPrivkey[0], BIGINT_SIZE);
                    packedPrivkey1 = bigintToBytes(packedPrivkey[1], BIGINT_SIZE);
                    privateKey = new Uint8Array(FIELD_SIZE);
                    privateKey.set(packedPrivkey0, 0);
                    privateKey.set(packedPrivkey1, BIGINT_SIZE);
                    return [4 /*yield*/, signRequests(data, privateKey)];
                case 1:
                    signatures = _a.sent();
                    return [2 /*return*/, signatures];
            }
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
            var keyPair, key, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, genKeyPair()];
                    case 1:
                        keyPair = _a.sent();
                        key = "".concat(this.contract.getUserAddress(), "_").concat(providerAddress);
                        // private key will be used for signing request
                        this.metadata.storeZKPrivateKey(key, keyPair.packedPrivkey);
                        // public key will be used to create serving account
                        return [2 /*return*/, keyPair.doublePackedPubkey];
                    case 2:
                        error_6 = _a.sent();
                        throw error_6;
                    case 3: return [2 /*return*/];
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
            {
                internalType: "string",
                name: "additionalInfo",
                type: "string",
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
                    {
                        internalType: "string",
                        name: "additionalInfo",
                        type: "string",
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
                    {
                        internalType: "string",
                        name: "additionalInfo",
                        type: "string",
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
var _bytecode = "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b613257806200007f6000396000f3fe60806040526004361061011f5760003560e01c8063746e78d7116100a0578063e12d4a5211610064578063e12d4a5214610333578063f2fde38b14610346578063f51acaea14610366578063fbfa4e1114610386578063fd590847146103a657600080fd5b8063746e78d71461029557806378c00436146102b55780638da5cb5b146102d557806399652de7146102f3578063b4988fd01461031357600080fd5b806321fe0f30116100e757806321fe0f30146101e6578063371c22c5146102085780634da824a8146102405780636341b2d114610260578063715018a61461028057600080fd5b806308e93d0a146101245780630b1d13921461014f5780630d668087146101645780630e61d15814610188578063158ef93e146101b5575b600080fd5b34801561013057600080fd5b506101396103d3565b6040516101469190612856565b60405180910390f35b61016261015d366004612977565b6103e4565b005b34801561017057600080fd5b5061017a60015481565b604051908152602001610146565b34801561019457600080fd5b506101a86101a33660046129da565b610437565b6040516101469190612ad8565b3480156101c157600080fd5b506000546101d690600160a01b900460ff1681565b6040519015158152602001610146565b3480156101f257600080fd5b506101fb61076c565b6040516101469190612aeb565b34801561021457600080fd5b50600254610228906001600160a01b031681565b6040516001600160a01b039091168152602001610146565b34801561024c57600080fd5b5061016261025b366004612b40565b610778565b34801561026c57600080fd5b5061016261027b366004612c0f565b610836565b34801561028c57600080fd5b50610162610961565b3480156102a157600080fd5b506101626102b0366004612d04565b610975565b3480156102c157600080fd5b506101626102d0366004612d1f565b6109a9565b3480156102e157600080fd5b506000546001600160a01b0316610228565b3480156102ff57600080fd5b5061016261030e366004612d5a565b610fc6565b34801561031f57600080fd5b5061016261032e366004612d84565b61102a565b610162610341366004612d04565b6110de565b34801561035257600080fd5b50610162610361366004612d04565b61112d565b34801561037257600080fd5b50610162610381366004612dc0565b6111a6565b34801561039257600080fd5b506101626103a1366004612df5565b6111f5565b3480156103b257600080fd5b506103c66103c1366004612e0e565b611202565b6040516101469190612e41565b60606103df600461132b565b905090565b6000806103f66004338787348861156c565b60408051838152602081018390529294509092506001600160a01b038716913391600080516020613202833981519152910160405180910390a35050505050565b61043f6125a1565b61044b600784846115d7565b60408051610120810190915281546001600160a01b0316815260018201805491929160208401919061047c90612e54565b80601f01602080910402602001604051908101604052809291908181526020018280546104a890612e54565b80156104f55780601f106104ca576101008083540402835291602001916104f5565b820191906000526020600020905b8154815290600101906020018083116104d857829003601f168201915b5050505050815260200160028201805461050e90612e54565b80601f016020809104026020016040519081016040528092919081815260200182805461053a90612e54565b80156105875780601f1061055c57610100808354040283529160200191610587565b820191906000526020600020905b81548152906001019060200180831161056a57829003601f168201915b505050505081526020016003820180546105a090612e54565b80601f01602080910402602001604051908101604052809291908181526020018280546105cc90612e54565b80156106195780601f106105ee57610100808354040283529160200191610619565b820191906000526020600020905b8154815290600101906020018083116105fc57829003601f168201915b5050505050815260200160048201548152602001600582015481526020016006820154815260200160078201805461065090612e54565b80601f016020809104026020016040519081016040528092919081815260200182805461067c90612e54565b80156106c95780601f1061069e576101008083540402835291602001916106c9565b820191906000526020600020905b8154815290600101906020018083116106ac57829003601f168201915b505050505081526020016008820180546106e290612e54565b80601f016020809104026020016040519081016040528092919081815260200182805461070e90612e54565b801561075b5780601f106107305761010080835404028352916020019161075b565b820191906000526020600020905b81548152906001019060200180831161073e57829003601f168201915b505050505081525050905092915050565b60606103df60076115ec565b60008060006107c43387878780806020026020016040519081016040528093929190818152602001838360200280828437600092019190915250506001546004959493925090506119ac565b6040519295509093509150339084156108fc029085906000818181858888f193505050501580156107f9573d6000803e3d6000fd5b5060408051838152602081018390526001600160a01b038816913391600080516020613202833981519152910160405180910390a3505050505050565b6108ec338b8b8b8b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050604080516020601f8f018190048102820181019092528d815292508d91508c908190840183828082843760009201919091525050604080516020601f8e018190048102820181019092528c815292508c91508b9081908401838280828437600092019190915250600798979695949392508b91508a9050611b6e565b896040516108fa9190612e8e565b6040518091039020336001600160a01b03167f95e1ef74a36b7d6ac766d338a4468c685d593739c3b7dc39e2aa5921a1e139328b8b8b8787428e8e8e8e60405161094d9a99989796959493929190612ed3565b60405180910390a350505050505050505050565b610969611c60565b6109736000611cba565b565b61097d611c60565b600280546001600160a01b039092166001600160a01b0319928316811790915560038054909216179055565b6003546000906001600160a01b031663ad12259a6109c78480612f46565b6109d46020870187612f46565b87604001356040518663ffffffff1660e01b81526004016109f9959493929190612fc2565b602060405180830381865afa158015610a16573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a3a9190612ffc565b905080610a8f5760405163885e287960e01b815260206004820152601f60248201527f5a4b20736574746c656d656e742076616c69646174696f6e206661696c65640060448201526064015b60405180910390fd5b6000610a9e6020840184612f46565b808060200260200160405190810160405280939291908181526020018383602002808284376000920182905250939450339250839150505b610ae36060870187612f46565b9050811015610f50576000610afb6060880188612f46565b83818110610b0b57610b0b61301e565b90506020020135905060008185610b22919061304a565b9050600080878781518110610b3957610b3961301e565b60200260200101519050600088886002610b53919061304a565b81518110610b6357610b6361301e565b60200260200101519050600089896003610b7d919061304a565b81518110610b8d57610b8d61301e565b602002602001015190506000610baf84336004611d0a9092919063ffffffff16565b90508a610bbd8b600561304a565b81518110610bcd57610bcd61301e565b602002602001015181600501600060028110610beb57610beb61301e565b0154141580610c3457508a610c018b600661304a565b81518110610c1157610c1161301e565b602002602001015181600501600160028110610c2f57610c2f61301e565b015414155b15610c825760405163885e287960e01b815260206004820152601760248201527f7369676e6572206b657920697320696e636f72726563740000000000000000006044820152606401610a86565b8281600201541115610cd75760405163885e287960e01b815260206004820152601a60248201527f696e697469616c206e6f6e636520697320696e636f72726563740000000000006044820152606401610a86565b895b86811015610ed95760008c8281518110610cf557610cf561301e565b6020026020010151905060008d836001610d0f919061304a565b81518110610d1f57610d1f61301e565b602002602001015190508d836003610d37919061304a565b81518110610d4757610d4761301e565b6020026020010151945060008e846004610d61919061304a565b81518110610d7157610d7161301e565b6020026020010151905060008a856009610d8b919061304a565b10610d97576000610dbc565b8f610da386600961304a565b81518110610db357610db361301e565b60200260200101515b90508015801590610dcd5750808710155b15610e0e5760405163885e287960e01b815260206004820152601060248201526f1b9bdb98d9481bdd995c9b185c1c195960821b6044820152606401610a86565b8884141580610e1d57508d8314155b15610eb557888403610e64576040518060400160405280601d81526020017f70726f7669646572206164647265737320697320696e636f7272656374000000815250610e9b565b6040518060400160405280601981526020017f75736572206164647265737320697320696e636f7272656374000000000000008152505b60405163885e287960e01b8152600401610a86919061305d565b610ebf828b61304a565b995050505050600781610ed2919061304a565b9050610cd9565b508481600301541015610f265760405163885e287960e01b8152602060048201526014602482015273696e73756666696369656e742062616c616e636560601b6044820152606401610a86565b610f308186611d17565b6002015550919550839250610f489150829050613070565b915050610ad6565b5082518214610fbf5760405163885e287960e01b815260206004820152603460248201527f6172726179207365676d656e7453697a652073756d206d69736d617463686573604482015273040e0eac4d8d2c640d2dce0eae840d8cadccee8d60631b6064820152608401610a86565b5050505050565b6000610fd56004338585611f20565b905080836001600160a01b0316336001600160a01b03167f54377dfdebf06f6df53fbda737d2dcd7e141f95bbfb0c1223437e856b9de3ac34260405161101d91815260200190565b60405180910390a4505050565b600054600160a01b900460ff161561108f5760405162461bcd60e51b815260206004820152602260248201527f496e697469616c697a61626c653a20616c726561647920696e697469616c697a604482015261195960f21b6064820152608401610a86565b6000805460ff60a01b1916600160a01b1790556110ab81611cba565b50600191909155600280546001600160a01b039092166001600160a01b0319928316811790915560038054909216179055565b6000806110ee6004338534612016565b60408051838152602081018390529294509092506001600160a01b038516913391600080516020613202833981519152910160405180910390a3505050565b611135611c60565b6001600160a01b03811661119a5760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610a86565b6111a381611cba565b50565b6111b2600733836120a2565b806040516111c09190612e8e565b6040519081900381209033907f68026479739e3662c0651578523384b94455e79bfb701ce111a3164591ceba7390600090a350565b6111fd611c60565b600155565b61120a6125f6565b61121660048484611d0a565b604080516101008101825282546001600160a01b039081168252600184015416602082015260028084015482840152600384015460608301526004840154608083015282518084019384905291939260a085019291600585019182845b815481526020019060010190808311611273575050505050815260200160078201805480602002602001604051908101604052809291908181526020016000905b8282101561130d576000848152602090819020604080516080810182526004860290920180548352600180820154848601526002820154928401929092526003015460ff161515606083015290835290920191016112b4565b5050505081526020016008820180546106e290612e54565b92915050565b60606000611338836120e5565b90508067ffffffffffffffff811115611353576113536128d4565b60405190808252806020026020018201604052801561138c57816020015b6113796125f6565b8152602001906001900390816113715790505b50915060005b81811015611565576113a484826120f0565b604080516101008101825282546001600160a01b039081168252600184015416602082015260028084015482840152600384015460608301526004840154608083015282518084019384905291939260a085019291600585019182845b815481526020019060010190808311611401575050505050815260200160078201805480602002602001604051908101604052809291908181526020016000905b8282101561149b576000848152602090819020604080516080810182526004860290920180548352600180820154848601526002820154928401929092526003015460ff16151560608301529083529092019101611442565b5050505081526020016008820180546114b390612e54565b80601f01602080910402602001604051908101604052809291908181526020018280546114df90612e54565b801561152c5780601f106115015761010080835404028352916020019161152c565b820191906000526020600020905b81548152906001019060200180831161150f57829003601f168201915b5050505050815250508382815181106115475761154761301e565b6020026020010181905250808061155d90613070565b915050611392565b5050919050565b600080600061157b8888612116565b90506115878982612158565b156115b857604051632cf0675960e21b81526001600160a01b03808a16600483015288166024820152604401610a86565b6115c789828a8a8a8a8a61216b565b5092976000975095505050505050565b60006115e48484846121db565b949350505050565b606060006115f9836120e5565b90508067ffffffffffffffff811115611614576116146128d4565b60405190808252806020026020018201604052801561164d57816020015b61163a6125a1565b8152602001906001900390816116325790505b50915060005b818110156115655761166584826120f0565b60408051610120810190915281546001600160a01b0316815260018201805491929160208401919061169690612e54565b80601f01602080910402602001604051908101604052809291908181526020018280546116c290612e54565b801561170f5780601f106116e45761010080835404028352916020019161170f565b820191906000526020600020905b8154815290600101906020018083116116f257829003601f168201915b5050505050815260200160028201805461172890612e54565b80601f016020809104026020016040519081016040528092919081815260200182805461175490612e54565b80156117a15780601f10611776576101008083540402835291602001916117a1565b820191906000526020600020905b81548152906001019060200180831161178457829003601f168201915b505050505081526020016003820180546117ba90612e54565b80601f01602080910402602001604051908101604052809291908181526020018280546117e690612e54565b80156118335780601f1061180857610100808354040283529160200191611833565b820191906000526020600020905b81548152906001019060200180831161181657829003601f168201915b5050505050815260200160048201548152602001600582015481526020016006820154815260200160078201805461186a90612e54565b80601f016020809104026020016040519081016040528092919081815260200182805461189690612e54565b80156118e35780601f106118b8576101008083540402835291602001916118e3565b820191906000526020600020905b8154815290600101906020018083116118c657829003601f168201915b505050505081526020016008820180546118fc90612e54565b80601f016020809104026020016040519081016040528092919081815260200182805461192890612e54565b80156119755780601f1061194a57610100808354040283529160200191611975565b820191906000526020600020905b81548152906001019060200180831161195857829003601f168201915b5050505050815250508382815181106119905761199061301e565b6020026020010181905250806119a590613070565b9050611653565b6000806000806119bd89898961222f565b90506000935060005b8651811015611b535760008782815181106119e3576119e361301e565b6020026020010151905082600701805490508110611a2e57604051637621e3f760e11b81526001600160a01b03808c1660048301528a16602482015260448101829052606401610a86565b6000836007018281548110611a4557611a4561301e565b60009182526020909120600490910201600381015490915060ff1615611a9857604051633cf6bf4160e01b81526001600160a01b03808d1660048301528b16602482015260448101839052606401610a86565b878160020154611aa8919061304a565b421015611ae257604051631779e03760e31b81526001600160a01b03808d1660048301528b16602482015260448101839052606401610a86565b8060010154846003016000828254611afa9190613089565b90915550506001810154600485018054600090611b18908490613089565b909155505060038101805460ff19166001908117909155810154611b3c908861304a565b965050508080611b4b90613070565b9150506119c6565b50806003015492508060040154915050955095509592505050565b6000611b7a8989612289565b9050611b868a82612158565b611be457611bdd8a826040518061012001604052808d6001600160a01b031681526020018c81526020018b81526020018a81526020018781526020018681526020014281526020018981526020018881525061229e565b5050611c55565b6000611bf18b8b8b6121db565b905060018101611c018a826130ea565b5060028101611c1089826130ea565b50600481018490556005810183905560038101611c2d88826130ea565b5042600682015560078101611c4287826130ea565b5060088101611c5186826130ea565b5050505b505050505050505050565b6000546001600160a01b031633146109735760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610a86565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60006115e484848461222f565b81600401548260030154611d2b9190613089565b811115611e9057600082600401548360030154611d489190613089565b611d529083613089565b90508083600401541015611db75760405163885e287960e01b815260206004820152602560248201527f696e73756666696369656e742062616c616e636520696e2070656e64696e675260448201526419599d5b9960da1b6064820152608401610a86565b80836004016000828254611dcb9190613089565b90915550506007830154600090611de490600190613089565b90505b60008112611e8d576000846007018281548110611e0657611e0661301e565b60009182526020909120600490910201600381015490915060ff1615611e2c5750611e7b565b82816001015411611e4d576001810154611e469084613089565b9250611e6b565b82816001016000828254611e619190613089565b9091555060009350505b82600003611e795750611e8d565b505b80611e85816131aa565b915050611de7565b50505b80826003016000828254611ea49190613089565b909155505081546003830154600484015460405133936001600160a01b03169260008051602061320283398151915292611ee692918252602082015260400190565b60405180910390a3604051339082156108fc029083906000818181858888f19350505050158015611f1b573d6000803e3d6000fd5b505050565b600080611f2e86868661222f565b90508281600401548260030154611f459190613089565b1015611f7757604051630a542ddd60e31b81526001600160a01b03808716600483015285166024820152604401610a86565b6040805160808101825260078301805480835260208084018881524295850195865260006060860181815260018086018755958252928120955160049485029096019586559051938501939093559351600284015592516003909201805460ff1916921515929092179091559082018054859290611ff690849061304a565b9091555050600781015461200c90600190613089565b9695505050505050565b60008060006120258686612116565b90506120318782612158565b61206157604051637e01ed7f60e01b81526001600160a01b03808816600483015286166024820152604401610a86565b600061206e88888861222f565b905084816003016000828254612084919061304a565b90915550506003810154600490910154909890975095505050505050565b60006120ae8383612289565b90506120ba8482612158565b6120db57828260405163edefcd8360e01b8152600401610a869291906131c7565b610fbf8482612364565b6000611325826123ef565b6000806120fd84846123f9565b6000908152600285016020526040902091505092915050565b604080516001600160a01b0380851660208301528316918101919091526000906060015b60405160208183030381529060405280519060200120905092915050565b60006121648383612405565b9392505050565b6000868152600280890160205260409091206003810184905580546001600160a01b038089166001600160a01b031992831617835560018301805491891691909216179055906121c19060058301908690612653565b50600881016121d083826130ea565b50611c55888861241d565b6000806121e88484612289565b600081815260028701602052604090209091506122058683612158565b61222657848460405163edefcd8360e01b8152600401610a869291906131c7565b95945050505050565b60008061223c8484612116565b600081815260028701602052604090209091506122598683612158565b61222657604051637e01ed7f60e01b81526001600160a01b03808716600483015285166024820152604401610a86565b6000828260405160200161213a9291906131c7565b600082815260028401602090815260408220835181546001600160a01b0319166001600160a01b039091161781559083015183919060018201906122e290826130ea565b50604082015160028201906122f790826130ea565b506060820151600382019061230c90826130ea565b506080820151600482015560a0820151600582015560c0820151600682015560e0820151600782019061233f90826130ea565b50610100820151600882019061235590826130ea565b506115e491508590508461241d565b6000818152600283016020526040812080546001600160a01b0319168155816123906001830182612691565b61239e600283016000612691565b6123ac600383016000612691565b6004820160009055600582016000905560068201600090556007820160006123d49190612691565b6123e2600883016000612691565b5061216490508383612429565b6000611325825490565b60006121648383612435565b60008181526001830160205260408120541515612164565b6000612164838361245f565b600061216483836124ae565b600082600001828154811061244c5761244c61301e565b9060005260206000200154905092915050565b60008181526001830160205260408120546124a657508154600181810184556000848152602080822090930184905584548482528286019093526040902091909155611325565b506000611325565b600081815260018301602052604081205480156125975760006124d2600183613089565b85549091506000906124e690600190613089565b905081811461254b5760008660000182815481106125065761250661301e565b90600052602060002001549050808760000184815481106125295761252961301e565b6000918252602080832090910192909255918252600188019052604090208390555b855486908061255c5761255c6131eb565b600190038181906000526020600020016000905590558560010160008681526020019081526020016000206000905560019350505050611325565b6000915050611325565b60405180610120016040528060006001600160a01b0316815260200160608152602001606081526020016060815260200160008152602001600081526020016000815260200160608152602001606081525090565b60405180610100016040528060006001600160a01b0316815260200160006001600160a01b0316815260200160008152602001600081526020016000815260200161263f6126cb565b815260200160608152602001606081525090565b8260028101928215612681579160200282015b82811115612681578235825591602001919060010190612666565b5061268d9291506126e9565b5090565b50805461269d90612e54565b6000825580601f106126ad575050565b601f0160209004906000526020600020908101906111a391906126e9565b60405180604001604052806002906020820280368337509192915050565b5b8082111561268d57600081556001016126ea565b8060005b6002811015612721578151845260209384019390910190600101612702565b50505050565b600081518084526020808501945080840160005b83811015612779578151805188528381015184890152604080820151908901526060908101511515908801526080909601959082019060010161273b565b509495945050505050565b60005b8381101561279f578181015183820152602001612787565b50506000910152565b600081518084526127c0816020860160208601612784565b601f01601f19169290920160200192915050565b600061012060018060a01b038084511685528060208501511660208601525060408301516040850152606083015160608501526080830151608085015260a083015161282360a08601826126fe565b5060c08301518160e086015261283b82860182612727565b91505060e083015184820361010086015261222682826127a8565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b828110156128ab57603f198886030184526128998583516127d4565b9450928501929085019060010161287d565b5092979650505050505050565b80356001600160a01b03811681146128cf57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600082601f8301126128fb57600080fd5b813567ffffffffffffffff80821115612916576129166128d4565b604051601f8301601f19908116603f0116810190828211818310171561293e5761293e6128d4565b8160405283815286602085880101111561295757600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060006080848603121561298c57600080fd5b612995846128b8565b925060608401858111156129a857600080fd5b6020850192503567ffffffffffffffff8111156129c457600080fd5b6129d0868287016128ea565b9150509250925092565b600080604083850312156129ed57600080fd5b6129f6836128b8565b9150602083013567ffffffffffffffff811115612a1257600080fd5b612a1e858286016128ea565b9150509250929050565b80516001600160a01b0316825260006101206020830151816020860152612a51828601826127a8565b91505060408301518482036040860152612a6b82826127a8565b91505060608301518482036060860152612a8582826127a8565b9150506080830151608085015260a083015160a085015260c083015160c085015260e083015184820360e0860152612abd82826127a8565b915050610100808401518583038287015261200c83826127a8565b6020815260006121646020830184612a28565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b828110156128ab57603f19888603018452612b2e858351612a28565b94509285019290850190600101612b12565b600080600060408486031215612b5557600080fd5b612b5e846128b8565b9250602084013567ffffffffffffffff80821115612b7b57600080fd5b818601915086601f830112612b8f57600080fd5b813581811115612b9e57600080fd5b8760208260051b8501011115612bb357600080fd5b6020830194508093505050509250925092565b60008083601f840112612bd857600080fd5b50813567ffffffffffffffff811115612bf057600080fd5b602083019150836020828501011115612c0857600080fd5b9250929050565b60008060008060008060008060008060e08b8d031215612c2e57600080fd5b8a3567ffffffffffffffff80821115612c4657600080fd5b612c528e838f016128ea565b9b5060208d0135915080821115612c6857600080fd5b612c748e838f016128ea565b9a5060408d0135915080821115612c8a57600080fd5b612c968e838f01612bc6565b909a50985060608d0135915080821115612caf57600080fd5b612cbb8e838f01612bc6565b909850965060808d0135915080821115612cd457600080fd5b50612ce18d828e01612bc6565b9b9e9a9d50989b979a969995989760a08101359660c09091013595509350505050565b600060208284031215612d1657600080fd5b612164826128b8565b600060208284031215612d3157600080fd5b813567ffffffffffffffff811115612d4857600080fd5b82016080818503121561216457600080fd5b60008060408385031215612d6d57600080fd5b612d76836128b8565b946020939093013593505050565b600080600060608486031215612d9957600080fd5b83359250612da9602085016128b8565b9150612db7604085016128b8565b90509250925092565b600060208284031215612dd257600080fd5b813567ffffffffffffffff811115612de957600080fd5b6115e4848285016128ea565b600060208284031215612e0757600080fd5b5035919050565b60008060408385031215612e2157600080fd5b612e2a836128b8565b9150612e38602084016128b8565b90509250929050565b60208152600061216460208301846127d4565b600181811c90821680612e6857607f821691505b602082108103612e8857634e487b7160e01b600052602260045260246000fd5b50919050565b60008251612ea0818460208701612784565b9190910192915050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b60e081526000612ee660e083018d6127a8565b8281036020840152612ef9818c8e612eaa565b905089604084015288606084015287608084015282810360a0840152612f20818789612eaa565b905082810360c0840152612f35818587612eaa565b9d9c50505050505050505050505050565b6000808335601e19843603018112612f5d57600080fd5b83018035915067ffffffffffffffff821115612f7857600080fd5b6020019150600581901b3603821315612c0857600080fd5b81835260006001600160fb1b03831115612fa957600080fd5b8260051b80836020870137939093016020019392505050565b606081526000612fd6606083018789612f90565b8281036020840152612fe9818688612f90565b9150508260408301529695505050505050565b60006020828403121561300e57600080fd5b8151801515811461216457600080fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b8082018082111561132557611325613034565b60208152600061216460208301846127a8565b60006001820161308257613082613034565b5060010190565b8181038181111561132557611325613034565b601f821115611f1b57600081815260208120601f850160051c810160208610156130c35750805b601f850160051c820191505b818110156130e2578281556001016130cf565b505050505050565b815167ffffffffffffffff811115613104576131046128d4565b613118816131128454612e54565b8461309c565b602080601f83116001811461314d57600084156131355750858301515b600019600386901b1c1916600185901b1785556130e2565b600085815260208120601f198616915b8281101561317c5788860151825594840194600190910190840161315d565b508582101561319a5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000600160ff1b82016131bf576131bf613034565b506000190190565b6001600160a01b03831681526040602082018190526000906115e4908301846127a8565b634e487b7160e01b600052603160045260246000fdfe526824944047da5b81071fb6349412005c5da81380b336103fbe5dd34556c776a2646970667358221220fcd3c61a67855afe55df1e03163cf261d7d1c60f50ffcf30d83c4483f491687a64736f6c63430008140033";
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
                        return [4 /*yield*/, this.serving.addAccount(providerAddress, signer, 'test', {
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
                        return [4 /*yield*/, tx.wait()];
                    case 2:
                        receipt = _a.sent();
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
            var extractor, sig, _a, nonce, outputFee, zkPrivateKey, updatedNonce, key, _b, fee, inputFee, zkInput, zkSig, error_1;
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
                        key = "".concat(this.contract.getUserAddress(), "_").concat(providerAddress);
                        this.metadata.storeNonce(key, updatedNonce);
                        return [4 /*yield*/, this.calculateFees(extractor, content, outputFee)];
                    case 3:
                        _b = _c.sent(), fee = _b.fee, inputFee = _b.inputFee;
                        zkInput = new Request(updatedNonce.toString(), fee.toString(), this.contract.getUserAddress(), providerAddress);
                        return [4 /*yield*/, signData([zkInput], zkPrivateKey)];
                    case 4:
                        zkSig = _c.sent();
                        sig = JSON.stringify(Array.from(zkSig[0]));
                        return [2 /*return*/, {
                                'X-Phala-Signature-Type': 'StandaloneApi',
                                Address: this.contract.getUserAddress(),
                                Fee: fee.toString(),
                                'Input-Fee': inputFee.toString(),
                                Nonce: updatedNonce.toString(),
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
