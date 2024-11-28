import { ethers, ContractFactory, Interface, Contract } from 'ethers';
import CryptoJS from 'crypto-js';
import { buildBabyjub, buildEddsa } from 'circomlibjs';

class Metadata {
    nodeStorage = {};
    initialized = false;
    constructor() { }
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.nodeStorage = {};
        this.initialized = true;
    }
    async setItem(key, value) {
        await this.initialize();
        this.nodeStorage[key] = value;
    }
    async getItem(key) {
        await this.initialize();
        return this.nodeStorage[key] ?? null;
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

var CacheValueTypeEnum;
(function (CacheValueTypeEnum) {
    CacheValueTypeEnum["Service"] = "service";
})(CacheValueTypeEnum || (CacheValueTypeEnum = {}));
class Cache {
    nodeStorage = {};
    initialized = false;
    constructor() { }
    async setItem(key, value, ttl, type) {
        await this.initialize();
        const now = new Date();
        const item = {
            type,
            value: Cache.encodeValue(value),
            expiry: now.getTime() + ttl,
        };
        this.nodeStorage[key] = JSON.stringify(item);
    }
    async getItem(key) {
        await this.initialize();
        const itemStr = this.nodeStorage[key] ?? null;
        if (!itemStr) {
            return null;
        }
        const item = JSON.parse(itemStr);
        const now = new Date();
        if (now.getTime() > item.expiry) {
            delete this.nodeStorage[key];
            return null;
        }
        return Cache.decodeValue(item.value, item.type);
    }
    async initialize() {
        if (this.initialized) {
            return;
        }
        this.nodeStorage = {};
        this.initialized = true;
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

class Extractor {
}

class ChatBot extends Extractor {
    svcInfo;
    constructor(svcInfo) {
        super();
        this.svcInfo = svcInfo;
    }
    getSvcInfo() {
        return Promise.resolve(this.svcInfo);
    }
    async getInputCount(content) {
        if (!content) {
            return 0;
        }
        return content.split(/\s+/).length;
    }
    async getOutputCount(content) {
        if (!content) {
            return 0;
        }
        return content.split(/\s+/).length;
    }
}

/**
 * MESSAGE_FOR_ENCRYPTION_KEY is a fixed message used to derive the encryption key.
 *
 * Background:
 * To ensure a consistent and unique encryption key can be generated from a user's Ethereum wallet,
 * we utilize a fixed message combined with a signing mechanism.
 *
 * Purpose:
 * - This string is provided to the Ethereum signing function to generate a digital signature based on the user's private key.
 * - The produced signature is then hashed (using SHA-256) to create a consistent 256-bit encryption key from the same wallet.
 * - This process offers a way to protect data without storing additional keys.
 *
 * Note:
 * - The uniqueness and stability of this message are crucial; do not change it unless you fully understand the impact
 *   on the key derivation and encryption process.
 * - Because the signature is derived from the wallet's private key, it ensures that different wallets cannot produce the same key.
 */
const MESSAGE_FOR_ENCRYPTION_KEY = 'MESSAGE_FOR_ENCRYPTION_KEY';

async function deriveEncryptionKey(signer) {
    const signature = await signer.signMessage(MESSAGE_FOR_ENCRYPTION_KEY);
    const hash = ethers.sha256(ethers.toUtf8Bytes(signature));
    return hash;
}
async function encryptData(signer, data) {
    const key = await deriveEncryptionKey(signer);
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
}
async function decryptData(signer, encryptedData) {
    const key = await deriveEncryptionKey(signer);
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
}

function strToPrivateKey(str) {
    const parsed = JSON.parse(str);
    if (!Array.isArray(parsed) || parsed.length !== 2) {
        throw new Error('Invalid input string');
    }
    const [first, second] = parsed.map((value) => {
        if (typeof value === 'string' || typeof value === 'number') {
            return BigInt(value);
        }
        throw new Error('Invalid number format');
    });
    return [first, second];
}
function privateKeyToStr(key) {
    try {
        return JSON.stringify(key.map((v) => v.toString()));
    }
    catch (error) {
        throw error;
    }
}

function getNonce() {
    const now = new Date();
    return now.getTime() * 10000 + 40;
}

let eddsa;
let babyjubjub;
async function initBabyJub() {
    if (!babyjubjub) {
        babyjubjub = await buildBabyjub();
    }
}
async function initEddsa() {
    if (!eddsa) {
        eddsa = await buildEddsa();
    }
}
async function babyJubJubGeneratePrivateKey() {
    await initBabyJub();
    return babyjubjub.F.random();
}
async function babyJubJubGeneratePublicKey(privateKey) {
    await initEddsa();
    return eddsa.prv2pub(privateKey);
}
async function babyJubJubSignature(msg, privateKey) {
    await initEddsa();
    return eddsa.signPedersen(privateKey, msg);
}
async function packSignature(signature) {
    await initEddsa();
    return eddsa.packSignature(signature);
}
async function packPoint(point) {
    await initBabyJub();
    return babyjubjub.packPoint(point);
}

const BYTE_SIZE = 8;
function bigintToBytes(bigint, length) {
    const bytes = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        bytes[i] = Number((bigint >> BigInt(BYTE_SIZE * i)) & BigInt(0xff));
    }
    return bytes;
}
function bytesToBigint(bytes) {
    let bigint = BigInt(0);
    for (let i = 0; i < bytes.length; i++) {
        bigint += BigInt(bytes[i]) << BigInt(BYTE_SIZE * i);
    }
    return bigint;
}

const FIELD_SIZE = 32;
async function signRequests(requests, privateKey) {
    const serializedRequestTrace = requests.map((request) => request.serialize());
    const signatures = [];
    for (let i = 0; i < serializedRequestTrace.length; i++) {
        const signature = await babyJubJubSignature(serializedRequestTrace[i], privateKey);
        signatures.push(await packSignature(signature));
    }
    return signatures;
}

const BIGINT_SIZE = 16;
async function genKeyPair() {
    // generate private key
    const privkey = await babyJubJubGeneratePrivateKey();
    // generate public key
    const pubkey = await babyJubJubGeneratePublicKey(privkey);
    // pack public key to FIELD_SIZE bytes
    const packedPubkey = await packPoint(pubkey);
    // unpack packed pubkey to bigint
    const packedPubkey0 = bytesToBigint(packedPubkey.slice(0, BIGINT_SIZE));
    const packedPubkey1 = bytesToBigint(packedPubkey.slice(BIGINT_SIZE));
    // unpack private key to bigint
    const packPrivkey0 = bytesToBigint(privkey.slice(0, BIGINT_SIZE));
    const packPrivkey1 = bytesToBigint(privkey.slice(BIGINT_SIZE));
    return {
        packedPrivkey: [packPrivkey0, packPrivkey1],
        doublePackedPubkey: [packedPubkey0, packedPubkey1],
    };
}
async function signData(data, packedPrivkey) {
    // unpack private key to bytes
    const packedPrivkey0 = bigintToBytes(packedPrivkey[0], BIGINT_SIZE);
    const packedPrivkey1 = bigintToBytes(packedPrivkey[1], BIGINT_SIZE);
    // combine bytes to Uint8Array
    const privateKey = new Uint8Array(FIELD_SIZE);
    privateKey.set(packedPrivkey0, 0);
    privateKey.set(packedPrivkey1, BIGINT_SIZE);
    // sign data
    const signatures = await signRequests(data, privateKey);
    return signatures;
}

const ADDR_LENGTH = 20;
const NONCE_LENGTH = 8;
const FEE_LENGTH = 16;
class Request {
    nonce;
    fee;
    userAddress;
    providerAddress;
    constructor(nonce, fee, userAddress, // hexstring format with '0x' prefix
    providerAddress // hexstring format with '0x' prefix
    ) {
        this.nonce = BigInt(nonce);
        this.fee = BigInt(fee);
        this.userAddress = BigInt(userAddress);
        this.providerAddress = BigInt(providerAddress);
    }
    serialize() {
        const buffer = new ArrayBuffer(NONCE_LENGTH + ADDR_LENGTH * 2 + FEE_LENGTH);
        let offset = 0;
        // write nonce (u64)
        const nonceBytes = bigintToBytes(this.nonce, NONCE_LENGTH);
        new Uint8Array(buffer, offset, NONCE_LENGTH).set(nonceBytes);
        offset += NONCE_LENGTH;
        // write fee (u128)
        const feeBytes = bigintToBytes(this.fee, FEE_LENGTH);
        new Uint8Array(buffer, offset, FEE_LENGTH).set(feeBytes);
        offset += FEE_LENGTH;
        // write userAddress (u160)
        const userAddressBytes = bigintToBytes(this.userAddress, ADDR_LENGTH);
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(userAddressBytes);
        offset += ADDR_LENGTH;
        // write providerAddress (u160)
        const providerAddressBytes = bigintToBytes(this.providerAddress, ADDR_LENGTH);
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(providerAddressBytes);
        offset += ADDR_LENGTH;
        return new Uint8Array(buffer);
    }
    static deserialize(byteArray) {
        const expectedLength = NONCE_LENGTH + ADDR_LENGTH * 2 + FEE_LENGTH;
        if (byteArray.length !== expectedLength) {
            throw new Error(`Invalid byte array length for deserialization. Expected: ${expectedLength}, but got: ${byteArray.length}`);
        }
        let offset = 0;
        // read nonce (u64)
        const nonce = bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + NONCE_LENGTH)));
        offset += NONCE_LENGTH;
        // read fee (u128)
        const fee = bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + FEE_LENGTH)));
        offset += FEE_LENGTH;
        // read userAddress (u160)
        const userAddress = bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH)));
        offset += ADDR_LENGTH;
        // read providerAddress (u160)
        const providerAddress = bytesToBigint(new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH)));
        offset += ADDR_LENGTH;
        return new Request(nonce.toString(), fee.toString(), '0x' + userAddress.toString(16), '0x' + providerAddress.toString(16));
    }
    // Getters
    getNonce() {
        return this.nonce;
    }
    getFee() {
        return this.fee;
    }
    getUserAddress() {
        return this.userAddress;
    }
    getProviderAddress() {
        return this.providerAddress;
    }
}

class ZGServingUserBrokerBase {
    contract;
    metadata;
    cache;
    constructor(contract, metadata, cache) {
        this.contract = contract;
        this.metadata = metadata;
        this.cache = cache;
    }
    async getProviderData(providerAddress) {
        const key = `${this.contract.getUserAddress()}_${providerAddress}`;
        const [settleSignerPrivateKey] = await Promise.all([
            this.metadata.getSettleSignerPrivateKey(key),
        ]);
        return { settleSignerPrivateKey };
    }
    async getService(providerAddress, svcName, useCache = true) {
        const key = providerAddress + svcName;
        const cachedSvc = await this.cache.getItem(key);
        if (cachedSvc && useCache) {
            return cachedSvc;
        }
        try {
            const svc = await this.contract.getService(providerAddress, svcName);
            await this.cache.setItem(key, svc, 1 * 60 * 1000, CacheValueTypeEnum.Service);
            return svc;
        }
        catch (error) {
            throw error;
        }
    }
    async getExtractor(providerAddress, svcName, useCache = true) {
        try {
            const svc = await this.getService(providerAddress, svcName, useCache);
            const extractor = this.createExtractor(svc);
            return extractor;
        }
        catch (error) {
            throw error;
        }
    }
    createExtractor(svc) {
        switch (svc.serviceType) {
            case 'chatbot':
                return new ChatBot(svc);
            default:
                throw new Error('Unknown service type');
        }
    }
    async getHeader(providerAddress, svcName, content, outputFee) {
        try {
            const extractor = await this.getExtractor(providerAddress, svcName);
            const { settleSignerPrivateKey } = await this.getProviderData(providerAddress);
            const key = `${this.contract.getUserAddress()}_${providerAddress}`;
            let privateKey = settleSignerPrivateKey;
            if (!privateKey) {
                const account = await this.contract.getAccount(providerAddress);
                const privateKeyStr = await decryptData(this.contract.signer, account.additionalInfo);
                privateKey = strToPrivateKey(privateKeyStr);
                this.metadata.storeSettleSignerPrivateKey(key, privateKey);
            }
            const nonce = getNonce();
            const inputFee = await this.calculateInputFees(extractor, content);
            const fee = inputFee + outputFee;
            const request = new Request(nonce.toString(), fee.toString(), this.contract.getUserAddress(), providerAddress);
            const settleSignature = await signData([request], privateKey);
            const sig = JSON.stringify(Array.from(settleSignature[0]));
            return {
                'X-Phala-Signature-Type': 'StandaloneApi',
                Address: this.contract.getUserAddress(),
                Fee: fee.toString(),
                'Input-Fee': inputFee.toString(),
                Nonce: nonce.toString(),
                'Previous-Output-Fee': outputFee.toString(),
                'Service-Name': svcName,
                Signature: sig,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async calculateInputFees(extractor, content) {
        const svc = await extractor.getSvcInfo();
        const inputCount = await extractor.getInputCount(content);
        const inputFee = BigInt(inputCount) * svc.inputPrice;
        return inputFee;
    }
}

/**
 * AccountProcessor contains methods for creating, depositing funds, and retrieving 0G Serving Accounts.
 */
class AccountProcessor extends ZGServingUserBrokerBase {
    async getAccount(provider) {
        try {
            const account = await this.contract.getAccount(provider);
            return account;
        }
        catch (error) {
            throw error;
        }
    }
    async listAccount() {
        try {
            const accounts = await this.contract.listAccount();
            return accounts;
        }
        catch (error) {
            throw error;
        }
    }
    async addAccount(providerAddress, balance) {
        try {
            try {
                const account = await this.getAccount(providerAddress);
                if (account) {
                    throw new Error('Account already exists, with balance: ' +
                        this.neuronToA0gi(account.balance) +
                        ' A0GI');
                }
            }
            catch (error) {
                if (!error.message.includes('AccountNotexists')) {
                    throw error;
                }
            }
            const { settleSignerPublicKey, settleSignerEncryptedPrivateKey } = await this.createSettleSignerKey(providerAddress);
            await this.contract.addAccount(providerAddress, settleSignerPublicKey, this.a0giToNeuron(balance), settleSignerEncryptedPrivateKey);
        }
        catch (error) {
            throw error;
        }
    }
    async deleteAccount(provider) {
        try {
            await this.contract.deleteAccount(provider);
        }
        catch (error) {
            throw error;
        }
    }
    async depositFund(providerAddress, balance) {
        try {
            const amount = this.a0giToNeuron(balance).toString();
            await this.contract.depositFund(providerAddress, amount);
        }
        catch (error) {
            throw error;
        }
    }
    async createSettleSignerKey(providerAddress) {
        try {
            // [pri, pub]
            const keyPair = await genKeyPair();
            const key = `${this.contract.getUserAddress()}_${providerAddress}`;
            this.metadata.storeSettleSignerPrivateKey(key, keyPair.packedPrivkey);
            const settleSignerEncryptedPrivateKey = await encryptData(this.contract.signer, privateKeyToStr(keyPair.packedPrivkey));
            return {
                settleSignerEncryptedPrivateKey,
                settleSignerPublicKey: keyPair.doublePackedPubkey,
            };
        }
        catch (error) {
            throw error;
        }
    }
    a0giToNeuron(value) {
        const valueStr = value.toFixed(18);
        const parts = valueStr.split('.');
        // Handle integer part
        const integerPart = parts[0];
        let integerPartAsBigInt = BigInt(integerPart) * BigInt(10 ** 18);
        // Handle fractional part if it exists
        if (parts.length > 1) {
            let fractionalPart = parts[1];
            while (fractionalPart.length < 18) {
                fractionalPart += '0';
            }
            if (fractionalPart.length > 18) {
                fractionalPart = fractionalPart.slice(0, 18); // Truncate to avoid overflow
            }
            const fractionalPartAsBigInt = BigInt(fractionalPart);
            integerPartAsBigInt += fractionalPartAsBigInt;
        }
        return integerPartAsBigInt;
    }
    neuronToA0gi(value) {
        const divisor = BigInt(10 ** 18);
        const integerPart = value / divisor;
        const remainder = value % divisor;
        const decimalPart = Number(remainder) / Number(divisor);
        return Number(integerPart) + decimalPart;
    }
}

/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
const _abi = [
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
        name: "deleteAccount",
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
const _bytecode = "0x60806040523480156200001157600080fd5b506200001d3362000023565b62000073565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b61339b80620000836000396000f3fe60806040526004361061012a5760003560e01c8063715018a6116100ab578063b4988fd01161006f578063b4988fd01461033e578063e12d4a521461035e578063f2fde38b14610371578063f51acaea14610391578063fbfa4e11146103b1578063fd590847146103d157600080fd5b8063715018a6146102ab578063746e78d7146102c057806378c00436146102e05780638da5cb5b1461030057806399652de71461031e57600080fd5b806321fe0f30116100f257806321fe0f30146101f1578063371c22c5146102135780634c1b64cb1461024b5780634da824a81461026b5780636341b2d11461028b57600080fd5b806308e93d0a1461012f5780630b1d13921461015a5780630d6680871461016f5780630e61d15814610193578063158ef93e146101c0575b600080fd5b34801561013b57600080fd5b506101446103fe565b60405161015191906129a2565b60405180910390f35b61016d610168366004612ac3565b61040f565b005b34801561017b57600080fd5b5061018560015481565b604051908152602001610151565b34801561019f57600080fd5b506101b36101ae366004612b26565b610462565b6040516101519190612c24565b3480156101cc57600080fd5b506000546101e190600160a01b900460ff1681565b6040519015158152602001610151565b3480156101fd57600080fd5b50610206610797565b6040516101519190612c37565b34801561021f57600080fd5b50600254610233906001600160a01b031681565b6040516001600160a01b039091168152602001610151565b34801561025757600080fd5b5061016d610266366004612c8c565b6107a3565b34801561027757600080fd5b5061016d610286366004612ca7565b6107b2565b34801561029757600080fd5b5061016d6102a6366004612d76565b610870565b3480156102b757600080fd5b5061016d61099b565b3480156102cc57600080fd5b5061016d6102db366004612c8c565b6109af565b3480156102ec57600080fd5b5061016d6102fb366004612e6b565b6109e3565b34801561030c57600080fd5b506000546001600160a01b0316610233565b34801561032a57600080fd5b5061016d610339366004612ea6565b611000565b34801561034a57600080fd5b5061016d610359366004612ed0565b611064565b61016d61036c366004612c8c565b611118565b34801561037d57600080fd5b5061016d61038c366004612c8c565b611167565b34801561039d57600080fd5b5061016d6103ac366004612f0c565b6111dd565b3480156103bd57600080fd5b5061016d6103cc366004612f41565b61122c565b3480156103dd57600080fd5b506103f16103ec366004612f5a565b611239565b6040516101519190612f8d565b606061040a6004611362565b905090565b600080610421600433878734886115a3565b60408051838152602081018390529294509092506001600160a01b038716913391600080516020613346833981519152910160405180910390a35050505050565b61046a61269e565b6104766007848461160e565b60408051610120810190915281546001600160a01b031681526001820180549192916020840191906104a790612fa0565b80601f01602080910402602001604051908101604052809291908181526020018280546104d390612fa0565b80156105205780601f106104f557610100808354040283529160200191610520565b820191906000526020600020905b81548152906001019060200180831161050357829003601f168201915b5050505050815260200160028201805461053990612fa0565b80601f016020809104026020016040519081016040528092919081815260200182805461056590612fa0565b80156105b25780601f10610587576101008083540402835291602001916105b2565b820191906000526020600020905b81548152906001019060200180831161059557829003601f168201915b505050505081526020016003820180546105cb90612fa0565b80601f01602080910402602001604051908101604052809291908181526020018280546105f790612fa0565b80156106445780601f1061061957610100808354040283529160200191610644565b820191906000526020600020905b81548152906001019060200180831161062757829003601f168201915b5050505050815260200160048201548152602001600582015481526020016006820154815260200160078201805461067b90612fa0565b80601f01602080910402602001604051908101604052809291908181526020018280546106a790612fa0565b80156106f45780601f106106c9576101008083540402835291602001916106f4565b820191906000526020600020905b8154815290600101906020018083116106d757829003601f168201915b5050505050815260200160088201805461070d90612fa0565b80601f016020809104026020016040519081016040528092919081815260200182805461073990612fa0565b80156107865780601f1061075b57610100808354040283529160200191610786565b820191906000526020600020905b81548152906001019060200180831161076957829003601f168201915b505050505081525050905092915050565b606061040a6007611623565b6107af600433836119e3565b50565b60008060006107fe338787878080602002602001604051908101604052809392919081815260200183836020028082843760009201919091525050600154600495949392509050611aa9565b6040519295509093509150339084156108fc029085906000818181858888f19350505050158015610833573d6000803e3d6000fd5b5060408051838152602081018390526001600160a01b038816913391600080516020613346833981519152910160405180910390a3505050505050565b610926338b8b8b8b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050604080516020601f8f018190048102820181019092528d815292508d91508c908190840183828082843760009201919091525050604080516020601f8e018190048102820181019092528c815292508c91508b9081908401838280828437600092019190915250600798979695949392508b91508a9050611c6b565b896040516109349190612fda565b6040518091039020336001600160a01b03167f95e1ef74a36b7d6ac766d338a4468c685d593739c3b7dc39e2aa5921a1e139328b8b8b8787428e8e8e8e6040516109879a9998979695949392919061301f565b60405180910390a350505050505050505050565b6109a3611d5d565b6109ad6000611db7565b565b6109b7611d5d565b600280546001600160a01b039092166001600160a01b0319928316811790915560038054909216179055565b6003546000906001600160a01b031663ad12259a610a018480613092565b610a0e6020870187613092565b87604001356040518663ffffffff1660e01b8152600401610a3395949392919061310e565b602060405180830381865afa158015610a50573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610a749190613148565b905080610ac95760405163885e287960e01b815260206004820152601f60248201527f5a4b20736574746c656d656e742076616c69646174696f6e206661696c65640060448201526064015b60405180910390fd5b6000610ad86020840184613092565b808060200260200160405190810160405280939291908181526020018383602002808284376000920182905250939450339250839150505b610b1d6060870187613092565b9050811015610f8a576000610b356060880188613092565b83818110610b4557610b4561316a565b90506020020135905060008185610b5c9190613196565b9050600080878781518110610b7357610b7361316a565b60200260200101519050600088886002610b8d9190613196565b81518110610b9d57610b9d61316a565b60200260200101519050600089896003610bb79190613196565b81518110610bc757610bc761316a565b602002602001015190506000610be984336004611e079092919063ffffffff16565b90508a610bf78b6005613196565b81518110610c0757610c0761316a565b602002602001015181600501600060028110610c2557610c2561316a565b0154141580610c6e57508a610c3b8b6006613196565b81518110610c4b57610c4b61316a565b602002602001015181600501600160028110610c6957610c6961316a565b015414155b15610cbc5760405163885e287960e01b815260206004820152601760248201527f7369676e6572206b657920697320696e636f72726563740000000000000000006044820152606401610ac0565b8281600201541115610d115760405163885e287960e01b815260206004820152601a60248201527f696e697469616c206e6f6e636520697320696e636f72726563740000000000006044820152606401610ac0565b895b86811015610f135760008c8281518110610d2f57610d2f61316a565b6020026020010151905060008d836001610d499190613196565b81518110610d5957610d5961316a565b602002602001015190508d836003610d719190613196565b81518110610d8157610d8161316a565b6020026020010151945060008e846004610d9b9190613196565b81518110610dab57610dab61316a565b6020026020010151905060008a856009610dc59190613196565b10610dd1576000610df6565b8f610ddd866009613196565b81518110610ded57610ded61316a565b60200260200101515b90508015801590610e075750808710155b15610e485760405163885e287960e01b815260206004820152601060248201526f1b9bdb98d9481bdd995c9b185c1c195960821b6044820152606401610ac0565b8884141580610e5757508d8314155b15610eef57888403610e9e576040518060400160405280601d81526020017f70726f7669646572206164647265737320697320696e636f7272656374000000815250610ed5565b6040518060400160405280601981526020017f75736572206164647265737320697320696e636f7272656374000000000000008152505b60405163885e287960e01b8152600401610ac091906131a9565b610ef9828b613196565b995050505050600781610f0c9190613196565b9050610d13565b508481600301541015610f605760405163885e287960e01b8152602060048201526014602482015273696e73756666696369656e742062616c616e636560601b6044820152606401610ac0565b610f6a8186611e14565b6002015550919550839250610f8291508290506131bc565b915050610b10565b5082518214610ff95760405163885e287960e01b815260206004820152603460248201527f6172726179207365676d656e7453697a652073756d206d69736d617463686573604482015273040e0eac4d8d2c640d2dce0eae840d8cadccee8d60631b6064820152608401610ac0565b5050505050565b600061100f600433858561201d565b905080836001600160a01b0316336001600160a01b03167f54377dfdebf06f6df53fbda737d2dcd7e141f95bbfb0c1223437e856b9de3ac34260405161105791815260200190565b60405180910390a4505050565b600054600160a01b900460ff16156110c95760405162461bcd60e51b815260206004820152602260248201527f496e697469616c697a61626c653a20616c726561647920696e697469616c697a604482015261195960f21b6064820152608401610ac0565b6000805460ff60a01b1916600160a01b1790556110e581611db7565b50600191909155600280546001600160a01b039092166001600160a01b0319928316811790915560038054909216179055565b6000806111286004338534612113565b60408051838152602081018390529294509092506001600160a01b038516913391600080516020613346833981519152910160405180910390a3505050565b61116f611d5d565b6001600160a01b0381166111d45760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610ac0565b6107af81611db7565b6111e96007338361219f565b806040516111f79190612fda565b6040519081900381209033907f68026479739e3662c0651578523384b94455e79bfb701ce111a3164591ceba7390600090a350565b611234611d5d565b600155565b6112416126f3565b61124d60048484611e07565b604080516101008101825282546001600160a01b039081168252600184015416602082015260028084015482840152600384015460608301526004840154608083015282518084019384905291939260a085019291600585019182845b8154815260200190600101908083116112aa575050505050815260200160078201805480602002602001604051908101604052809291908181526020016000905b82821015611344576000848152602090819020604080516080810182526004860290920180548352600180820154848601526002820154928401929092526003015460ff161515606083015290835290920191016112eb565b50505050815260200160088201805461070d90612fa0565b92915050565b6060600061136f836121e2565b90508067ffffffffffffffff81111561138a5761138a612a20565b6040519080825280602002602001820160405280156113c357816020015b6113b06126f3565b8152602001906001900390816113a85790505b50915060005b8181101561159c576113db84826121ed565b604080516101008101825282546001600160a01b039081168252600184015416602082015260028084015482840152600384015460608301526004840154608083015282518084019384905291939260a085019291600585019182845b815481526020019060010190808311611438575050505050815260200160078201805480602002602001604051908101604052809291908181526020016000905b828210156114d2576000848152602090819020604080516080810182526004860290920180548352600180820154848601526002820154928401929092526003015460ff16151560608301529083529092019101611479565b5050505081526020016008820180546114ea90612fa0565b80601f016020809104026020016040519081016040528092919081815260200182805461151690612fa0565b80156115635780601f1061153857610100808354040283529160200191611563565b820191906000526020600020905b81548152906001019060200180831161154657829003601f168201915b50505050508152505083828151811061157e5761157e61316a565b60200260200101819052508080611594906131bc565b9150506113c9565b5050919050565b60008060006115b28888612213565b90506115be8982612255565b156115ef57604051632cf0675960e21b81526001600160a01b03808a16600483015288166024820152604401610ac0565b6115fe89828a8a8a8a8a612268565b5092976000975095505050505050565b600061161b8484846122d8565b949350505050565b60606000611630836121e2565b90508067ffffffffffffffff81111561164b5761164b612a20565b60405190808252806020026020018201604052801561168457816020015b61167161269e565b8152602001906001900390816116695790505b50915060005b8181101561159c5761169c84826121ed565b60408051610120810190915281546001600160a01b031681526001820180549192916020840191906116cd90612fa0565b80601f01602080910402602001604051908101604052809291908181526020018280546116f990612fa0565b80156117465780601f1061171b57610100808354040283529160200191611746565b820191906000526020600020905b81548152906001019060200180831161172957829003601f168201915b5050505050815260200160028201805461175f90612fa0565b80601f016020809104026020016040519081016040528092919081815260200182805461178b90612fa0565b80156117d85780601f106117ad576101008083540402835291602001916117d8565b820191906000526020600020905b8154815290600101906020018083116117bb57829003601f168201915b505050505081526020016003820180546117f190612fa0565b80601f016020809104026020016040519081016040528092919081815260200182805461181d90612fa0565b801561186a5780601f1061183f5761010080835404028352916020019161186a565b820191906000526020600020905b81548152906001019060200180831161184d57829003601f168201915b505050505081526020016004820154815260200160058201548152602001600682015481526020016007820180546118a190612fa0565b80601f01602080910402602001604051908101604052809291908181526020018280546118cd90612fa0565b801561191a5780601f106118ef5761010080835404028352916020019161191a565b820191906000526020600020905b8154815290600101906020018083116118fd57829003601f168201915b5050505050815260200160088201805461193390612fa0565b80601f016020809104026020016040519081016040528092919081815260200182805461195f90612fa0565b80156119ac5780601f10611981576101008083540402835291602001916119ac565b820191906000526020600020905b81548152906001019060200180831161198f57829003601f168201915b5050505050815250508382815181106119c7576119c761316a565b6020026020010181905250806119dc906131bc565b905061168a565b60006119ef8383612213565b90506119fb8482612255565b611a2b57604051637e01ed7f60e01b81526001600160a01b03808516600483015283166024820152604401610ac0565b611a35848261232c565b50600081815260028086016020526040822080546001600160a01b0319908116825560018201805490911690559081018290556003810182905560048101829055600581018290556006810182905590611a93600783016000612750565b611aa1600883016000612771565b505050505050565b600080600080611aba898989612338565b90506000935060005b8651811015611c50576000878281518110611ae057611ae061316a565b6020026020010151905082600701805490508110611b2b57604051637621e3f760e11b81526001600160a01b03808c1660048301528a16602482015260448101829052606401610ac0565b6000836007018281548110611b4257611b4261316a565b60009182526020909120600490910201600381015490915060ff1615611b9557604051633cf6bf4160e01b81526001600160a01b03808d1660048301528b16602482015260448101839052606401610ac0565b878160020154611ba59190613196565b421015611bdf57604051631779e03760e31b81526001600160a01b03808d1660048301528b16602482015260448101839052606401610ac0565b8060010154846003016000828254611bf791906131d5565b90915550506001810154600485018054600090611c159084906131d5565b909155505060038101805460ff19166001908117909155810154611c399088613196565b965050508080611c48906131bc565b915050611ac3565b50806003015492508060040154915050955095509592505050565b6000611c778989612392565b9050611c838a82612255565b611ce157611cda8a826040518061012001604052808d6001600160a01b031681526020018c81526020018b81526020018a8152602001878152602001868152602001428152602001898152602001888152506123a7565b5050611d52565b6000611cee8b8b8b6122d8565b905060018101611cfe8a8261322e565b5060028101611d0d898261322e565b50600481018490556005810183905560038101611d2a888261322e565b5042600682015560078101611d3f878261322e565b5060088101611d4e868261322e565b5050505b505050505050505050565b6000546001600160a01b031633146109ad5760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610ac0565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b600061161b848484612338565b81600401548260030154611e2891906131d5565b811115611f8d57600082600401548360030154611e4591906131d5565b611e4f90836131d5565b90508083600401541015611eb45760405163885e287960e01b815260206004820152602560248201527f696e73756666696369656e742062616c616e636520696e2070656e64696e675260448201526419599d5b9960da1b6064820152608401610ac0565b80836004016000828254611ec891906131d5565b90915550506007830154600090611ee1906001906131d5565b90505b60008112611f8a576000846007018281548110611f0357611f0361316a565b60009182526020909120600490910201600381015490915060ff1615611f295750611f78565b82816001015411611f4a576001810154611f4390846131d5565b9250611f68565b82816001016000828254611f5e91906131d5565b9091555060009350505b82600003611f765750611f8a565b505b80611f82816132ee565b915050611ee4565b50505b80826003016000828254611fa191906131d5565b909155505081546003830154600484015460405133936001600160a01b03169260008051602061334683398151915292611fe392918252602082015260400190565b60405180910390a3604051339082156108fc029083906000818181858888f19350505050158015612018573d6000803e3d6000fd5b505050565b60008061202b868686612338565b9050828160040154826003015461204291906131d5565b101561207457604051630a542ddd60e31b81526001600160a01b03808716600483015285166024820152604401610ac0565b6040805160808101825260078301805480835260208084018881524295850195865260006060860181815260018086018755958252928120955160049485029096019586559051938501939093559351600284015592516003909201805460ff19169215159290921790915590820180548592906120f3908490613196565b90915550506007810154612109906001906131d5565b9695505050505050565b60008060006121228686612213565b905061212e8782612255565b61215e57604051637e01ed7f60e01b81526001600160a01b03808816600483015286166024820152604401610ac0565b600061216b888888612338565b9050848160030160008282546121819190613196565b90915550506003810154600490910154909890975095505050505050565b60006121ab8383612392565b90506121b78482612255565b6121d857828260405163edefcd8360e01b8152600401610ac092919061330b565b610ff9848261246d565b600061135c826124f8565b6000806121fa8484612502565b6000908152600285016020526040902091505092915050565b604080516001600160a01b0380851660208301528316918101919091526000906060015b60405160208183030381529060405280519060200120905092915050565b6000612261838361250e565b9392505050565b6000868152600280890160205260409091206003810184905580546001600160a01b038089166001600160a01b031992831617835560018301805491891691909216179055906122be90600583019086906127ab565b50600881016122cd838261322e565b50611d528888612526565b6000806122e58484612392565b600081815260028701602052604090209091506123028683612255565b61232357848460405163edefcd8360e01b8152600401610ac092919061330b565b95945050505050565b60006122618383612532565b6000806123458484612213565b600081815260028701602052604090209091506123628683612255565b61232357604051637e01ed7f60e01b81526001600160a01b03808716600483015285166024820152604401610ac0565b6000828260405160200161223792919061330b565b600082815260028401602090815260408220835181546001600160a01b0319166001600160a01b039091161781559083015183919060018201906123eb908261322e565b5060408201516002820190612400908261322e565b5060608201516003820190612415908261322e565b506080820151600482015560a0820151600582015560c0820151600682015560e08201516007820190612448908261322e565b50610100820151600882019061245e908261322e565b5061161b915085905084612526565b6000818152600283016020526040812080546001600160a01b0319168155816124996001830182612771565b6124a7600283016000612771565b6124b5600383016000612771565b6004820160009055600582016000905560068201600090556007820160006124dd9190612771565b6124eb600883016000612771565b506122619050838361232c565b600061135c825490565b60006122618383612625565b60008181526001830160205260408120541515612261565b6000612261838361264f565b6000818152600183016020526040812054801561261b5760006125566001836131d5565b855490915060009061256a906001906131d5565b90508181146125cf57600086600001828154811061258a5761258a61316a565b90600052602060002001549050808760000184815481106125ad576125ad61316a565b6000918252602080832090910192909255918252600188019052604090208390555b85548690806125e0576125e061332f565b60019003818190600052602060002001600090559055856001016000868152602001908152602001600020600090556001935050505061135c565b600091505061135c565b600082600001828154811061263c5761263c61316a565b9060005260206000200154905092915050565b60008181526001830160205260408120546126965750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915561135c565b50600061135c565b60405180610120016040528060006001600160a01b0316815260200160608152602001606081526020016060815260200160008152602001600081526020016000815260200160608152602001606081525090565b60405180610100016040528060006001600160a01b0316815260200160006001600160a01b0316815260200160008152602001600081526020016000815260200161273c6127e9565b815260200160608152602001606081525090565b50805460008255600402906000526020600020908101906107af9190612807565b50805461277d90612fa0565b6000825580601f1061278d575050565b601f0160209004906000526020600020908101906107af9190612835565b82600281019282156127d9579160200282015b828111156127d95782358255916020019190600101906127be565b506127e5929150612835565b5090565b60405180604001604052806002906020820280368337509192915050565b5b808211156127e557600080825560018201819055600282015560038101805460ff19169055600401612808565b5b808211156127e55760008155600101612836565b8060005b600281101561286d57815184526020938401939091019060010161284e565b50505050565b600081518084526020808501945080840160005b838110156128c55781518051885283810151848901526040808201519089015260609081015115159088015260809096019590820190600101612887565b509495945050505050565b60005b838110156128eb5781810151838201526020016128d3565b50506000910152565b6000815180845261290c8160208601602086016128d0565b601f01601f19169290920160200192915050565b600061012060018060a01b038084511685528060208501511660208601525060408301516040850152606083015160608501526080830151608085015260a083015161296f60a086018261284a565b5060c08301518160e086015261298782860182612873565b91505060e083015184820361010086015261232382826128f4565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b828110156129f757603f198886030184526129e5858351612920565b945092850192908501906001016129c9565b5092979650505050505050565b80356001600160a01b0381168114612a1b57600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112612a4757600080fd5b813567ffffffffffffffff80821115612a6257612a62612a20565b604051601f8301601f19908116603f01168101908282118183101715612a8a57612a8a612a20565b81604052838152866020858801011115612aa357600080fd5b836020870160208301376000602085830101528094505050505092915050565b600080600060808486031215612ad857600080fd5b612ae184612a04565b92506060840185811115612af457600080fd5b6020850192503567ffffffffffffffff811115612b1057600080fd5b612b1c86828701612a36565b9150509250925092565b60008060408385031215612b3957600080fd5b612b4283612a04565b9150602083013567ffffffffffffffff811115612b5e57600080fd5b612b6a85828601612a36565b9150509250929050565b80516001600160a01b0316825260006101206020830151816020860152612b9d828601826128f4565b91505060408301518482036040860152612bb782826128f4565b91505060608301518482036060860152612bd182826128f4565b9150506080830151608085015260a083015160a085015260c083015160c085015260e083015184820360e0860152612c0982826128f4565b915050610100808401518583038287015261210983826128f4565b6020815260006122616020830184612b74565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b828110156129f757603f19888603018452612c7a858351612b74565b94509285019290850190600101612c5e565b600060208284031215612c9e57600080fd5b61226182612a04565b600080600060408486031215612cbc57600080fd5b612cc584612a04565b9250602084013567ffffffffffffffff80821115612ce257600080fd5b818601915086601f830112612cf657600080fd5b813581811115612d0557600080fd5b8760208260051b8501011115612d1a57600080fd5b6020830194508093505050509250925092565b60008083601f840112612d3f57600080fd5b50813567ffffffffffffffff811115612d5757600080fd5b602083019150836020828501011115612d6f57600080fd5b9250929050565b60008060008060008060008060008060e08b8d031215612d9557600080fd5b8a3567ffffffffffffffff80821115612dad57600080fd5b612db98e838f01612a36565b9b5060208d0135915080821115612dcf57600080fd5b612ddb8e838f01612a36565b9a5060408d0135915080821115612df157600080fd5b612dfd8e838f01612d2d565b909a50985060608d0135915080821115612e1657600080fd5b612e228e838f01612d2d565b909850965060808d0135915080821115612e3b57600080fd5b50612e488d828e01612d2d565b9b9e9a9d50989b979a969995989760a08101359660c09091013595509350505050565b600060208284031215612e7d57600080fd5b813567ffffffffffffffff811115612e9457600080fd5b82016080818503121561226157600080fd5b60008060408385031215612eb957600080fd5b612ec283612a04565b946020939093013593505050565b600080600060608486031215612ee557600080fd5b83359250612ef560208501612a04565b9150612f0360408501612a04565b90509250925092565b600060208284031215612f1e57600080fd5b813567ffffffffffffffff811115612f3557600080fd5b61161b84828501612a36565b600060208284031215612f5357600080fd5b5035919050565b60008060408385031215612f6d57600080fd5b612f7683612a04565b9150612f8460208401612a04565b90509250929050565b6020815260006122616020830184612920565b600181811c90821680612fb457607f821691505b602082108103612fd457634e487b7160e01b600052602260045260246000fd5b50919050565b60008251612fec8184602087016128d0565b9190910192915050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b60e08152600061303260e083018d6128f4565b8281036020840152613045818c8e612ff6565b905089604084015288606084015287608084015282810360a084015261306c818789612ff6565b905082810360c0840152613081818587612ff6565b9d9c50505050505050505050505050565b6000808335601e198436030181126130a957600080fd5b83018035915067ffffffffffffffff8211156130c457600080fd5b6020019150600581901b3603821315612d6f57600080fd5b81835260006001600160fb1b038311156130f557600080fd5b8260051b80836020870137939093016020019392505050565b6060815260006131226060830187896130dc565b82810360208401526131358186886130dc565b9150508260408301529695505050505050565b60006020828403121561315a57600080fd5b8151801515811461226157600080fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b8082018082111561135c5761135c613180565b60208152600061226160208301846128f4565b6000600182016131ce576131ce613180565b5060010190565b8181038181111561135c5761135c613180565b601f82111561201857600081815260208120601f850160051c8101602086101561320f5750805b601f850160051c820191505b81811015611aa15782815560010161321b565b815167ffffffffffffffff81111561324857613248612a20565b61325c816132568454612fa0565b846131e8565b602080601f83116001811461329157600084156132795750858301515b600019600386901b1c1916600185901b178555611aa1565b600085815260208120601f198616915b828110156132c0578886015182559484019460019091019084016132a1565b50858210156132de5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000600160ff1b820161330357613303613180565b506000190190565b6001600160a01b038316815260406020820181905260009061161b908301846128f4565b634e487b7160e01b600052603160045260246000fdfe526824944047da5b81071fb6349412005c5da81380b336103fbe5dd34556c776a26469706673582212200be56aaec0ee2d37ceea12d1034381a3de0a1857fb059bd91f3561451861a7af64736f6c63430008140033";
const isSuperArgs = (xs) => xs.length > 1;
class Serving__factory extends ContractFactory {
    constructor(...args) {
        if (isSuperArgs(args)) {
            super(...args);
        }
        else {
            super(_abi, _bytecode, args[0]);
        }
    }
    getDeployTransaction(overrides) {
        return super.getDeployTransaction(overrides || {});
    }
    deploy(overrides) {
        return super.deploy(overrides || {});
    }
    connect(runner) {
        return super.connect(runner);
    }
    static bytecode = _bytecode;
    static abi = _abi;
    static createInterface() {
        return new Interface(_abi);
    }
    static connect(address, runner) {
        return new Contract(address, _abi, runner);
    }
}

class ServingContract {
    serving;
    signer;
    _userAddress;
    constructor(signer, contractAddress, userAddress) {
        this.serving = Serving__factory.connect(contractAddress, signer);
        this.signer = signer;
        this._userAddress = userAddress;
    }
    lockTime() {
        return this.serving.lockTime();
    }
    async listService() {
        try {
            const services = await this.serving.getAllServices();
            return services;
        }
        catch (error) {
            throw error;
        }
    }
    async listAccount() {
        try {
            const accounts = await this.serving.getAllAccounts();
            return accounts;
        }
        catch (error) {
            throw error;
        }
    }
    async getAccount(provider) {
        try {
            const user = this.getUserAddress();
            const account = await this.serving.getAccount(user, provider);
            return account;
        }
        catch (error) {
            throw error;
        }
    }
    async deleteAccount(provider) {
        try {
            const tx = await this.serving.deleteAccount(provider);
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed');
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async addOrUpdateService(name, serviceType, url, model, verifiability, inputPrice, outputPrice) {
        try {
            const tx = await this.serving.addOrUpdateService(name, serviceType, url, model, verifiability, inputPrice, outputPrice);
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed');
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async addAccount(providerAddress, signer, balance, settleSignerEncryptedPrivateKey) {
        try {
            const tx = await this.serving.addAccount(providerAddress, signer, settleSignerEncryptedPrivateKey, {
                value: balance,
            });
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed');
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async depositFund(providerAddress, balance) {
        try {
            const tx = await this.serving.depositFund(providerAddress, {
                value: balance,
            });
            const receipt = await tx.wait();
            if (!receipt || receipt.status !== 1) {
                const error = new Error('Transaction failed');
                throw error;
            }
        }
        catch (error) {
            throw error;
        }
    }
    async getService(providerAddress, svcName) {
        try {
            return this.serving.getService(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    }
    getUserAddress() {
        return this._userAddress;
    }
}

/**
 * RequestProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
class RequestProcessor extends ZGServingUserBrokerBase {
    async getServiceMetadata(providerAddress, svcName) {
        const service = await this.getService(providerAddress, svcName);
        return {
            endpoint: `${service.url}/v1/proxy/${svcName}`,
            model: service.model,
        };
    }
    async getRequestHeaders(providerAddress, svcName, content) {
        const headers = await this.getHeader(providerAddress, svcName, content, BigInt(0));
        return headers;
    }
}

var VerifiabilityEnum;
(function (VerifiabilityEnum) {
    VerifiabilityEnum["OpML"] = "OpML";
    VerifiabilityEnum["TeeML"] = "TeeML";
    VerifiabilityEnum["ZKML"] = "ZKML";
})(VerifiabilityEnum || (VerifiabilityEnum = {}));
class ModelProcessor extends ZGServingUserBrokerBase {
    async listService() {
        try {
            const services = await this.contract.listService();
            return services;
        }
        catch (error) {
            throw error;
        }
    }
}
function isVerifiability(value) {
    return Object.values(VerifiabilityEnum).includes(value);
}

/**
 * The Verifier class contains methods for verifying service reliability.
 */
class Verifier extends ZGServingUserBrokerBase {
    async verifyService(providerAddress, svcName) {
        try {
            const { valid } = await this.getSigningAddress(providerAddress, svcName, true);
            return valid;
        }
        catch (error) {
            throw error;
        }
    }
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
    async getSigningAddress(providerAddress, svcName, verifyRA = false) {
        const key = `${this.contract.getUserAddress()}_${providerAddress}_${svcName}`;
        let signingKey = await this.metadata.getSigningKey(key);
        if (!verifyRA && signingKey) {
            return {
                valid: null,
                signingAddress: signingKey,
            };
        }
        try {
            const extractor = await this.getExtractor(providerAddress, svcName, false);
            const svc = await extractor.getSvcInfo();
            const signerRA = await Verifier.fetSignerRA(svc.url, svc.name);
            if (!signerRA?.signing_address) {
                throw new Error('signing address does not exist');
            }
            signingKey = `${this.contract.getUserAddress()}_${providerAddress}_${svcName}`;
            await this.metadata.storeSigningKey(signingKey, signerRA.signing_address);
            // TODO: use intel_quote to verify signing address
            const valid = await Verifier.verifyRA(signerRA.nvidia_payload);
            return {
                valid,
                signingAddress: signerRA.signing_address,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getSignerRaDownloadLink(providerAddress, svcName) {
        try {
            const svc = await this.getService(providerAddress, svcName);
            return `${svc.url}/v1/proxy/${svcName}/attestation/report`;
        }
        catch (error) {
            throw error;
        }
    }
    async getChatSignatureDownloadLink(providerAddress, svcName, chatID) {
        try {
            const svc = await this.getService(providerAddress, svcName);
            return `${svc.url}/v1/proxy/${svcName}/signature/${chatID}`;
        }
        catch (error) {
            throw error;
        }
    }
    // TODO: add test
    static async verifyRA(nvidia_payload) {
        return fetch('https://nras.attestation.nvidia.com/v3/attest/gpu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(nvidia_payload),
        })
            .then((response) => {
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
            .catch((error) => {
            if (error instanceof Error) {
                console.error(error.message);
            }
            return false;
        });
    }
    static async fetSignerRA(providerBrokerURL, svcName) {
        return fetch(`${providerBrokerURL}/v1/proxy/${svcName}/attestation/report`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then((data) => {
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
                    const intel_quota = JSON.parse(data.intel_quote);
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
            .catch((error) => {
            throw error;
        });
    }
    static async fetSignatureByChatID(providerBrokerURL, svcName, chatID) {
        return fetch(`${providerBrokerURL}/v1/proxy/${svcName}/signature/${chatID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error('getting signature error');
            }
            return response.json();
        })
            .then((data) => {
            return data;
        })
            .catch((error) => {
            throw error;
        });
    }
    static verifySignature(message, signature, expectedAddress) {
        const messageHash = ethers.hashMessage(message);
        const recoveredAddress = ethers.recoverAddress(messageHash, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    }
}

/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
class ResponseProcessor extends ZGServingUserBrokerBase {
    verifier;
    constructor(contract, metadata, cache) {
        super(contract, metadata, cache);
        this.contract = contract;
        this.metadata = metadata;
        this.verifier = new Verifier(contract, metadata, cache);
    }
    /**
     * settleFee sends an empty request to the service provider to settle the fee.
     */
    async settleFee(providerAddress, serviceName, fee) {
        try {
            if (!fee) {
                return;
            }
            const service = await this.contract.getService(providerAddress, serviceName);
            if (!service) {
                throw new Error('Service is not available');
            }
            const { provider, name, url } = service;
            const headers = await this.getHeader(provider, name, '', fee);
            const response = await fetch(`${url}/v1/proxy/${name}/settle-fee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            });
            if (response.status !== 202 && response.status !== 200) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }
        }
        catch (error) {
            throw error;
        }
    }
    async processResponse(providerAddress, svcName, content, chatID) {
        try {
            let extractor;
            extractor = await this.getExtractor(providerAddress, svcName);
            const outputFee = await this.calculateOutputFees(extractor, content);
            await this.settleFee(providerAddress, svcName, outputFee);
            const svc = await extractor.getSvcInfo();
            // TODO: Temporarily return true for non-TeeML verifiability.
            // these cases will be handled in the future.
            if (isVerifiability(svc.verifiability) ||
                svc.verifiability !== VerifiabilityEnum.TeeML) {
                return true;
            }
            if (!chatID) {
                throw new Error('Chat ID does not exist');
            }
            let singerRAVerificationResult = await this.verifier.getSigningAddress(providerAddress, svcName);
            if (!singerRAVerificationResult.valid) {
                singerRAVerificationResult =
                    await this.verifier.getSigningAddress(providerAddress, svcName, true);
            }
            if (!singerRAVerificationResult.valid) {
                throw new Error('Signing address is invalid');
            }
            const ResponseSignature = await Verifier.fetSignatureByChatID(svc.url, svcName, chatID);
            return Verifier.verifySignature(ResponseSignature.text, `0x${ResponseSignature.signature}`, singerRAVerificationResult.signingAddress);
        }
        catch (error) {
            throw error;
        }
    }
    async calculateOutputFees(extractor, content) {
        const svc = await extractor.getSvcInfo();
        const outputCount = await extractor.getOutputCount(content);
        return BigInt(outputCount) * svc.outputPrice;
    }
}

class ZGServingNetworkBroker {
    requestProcessor;
    responseProcessor;
    verifier;
    accountProcessor;
    modelProcessor;
    signer;
    contractAddress;
    constructor(signer, contractAddress) {
        this.signer = signer;
        this.contractAddress = contractAddress;
    }
    async initialize() {
        let userAddress;
        try {
            userAddress = await this.signer.getAddress();
        }
        catch (error) {
            throw error;
        }
        const contract = new ServingContract(this.signer, this.contractAddress, userAddress);
        const metadata = new Metadata();
        const cache = new Cache();
        this.requestProcessor = new RequestProcessor(contract, metadata, cache);
        this.responseProcessor = new ResponseProcessor(contract, metadata, cache);
        this.accountProcessor = new AccountProcessor(contract, metadata, cache);
        this.modelProcessor = new ModelProcessor(contract, metadata, cache);
        this.verifier = new Verifier(contract, metadata, cache);
    }
    /**
     * Retrieves a list of services from the contract.
     *
     * @returns {Promise<ServiceStructOutput[]>} A promise that resolves to an array of ServiceStructOutput objects.
     * @throws An error if the service list cannot be retrieved.
     */
    listService = async () => {
        try {
            return await this.modelProcessor.listService();
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Adds a new account to the contract.
     *
     * @param providerAddress - The address of the provider for whom the account is being created.
     * @param balance - The initial balance to be assigned to the new account. Units are in A0GI.
     *
     * @throws  An error if the account creation fails.
     *
     * @remarks
     * When creating an account, a key pair is also created to sign the request.
     */
    addAccount = async (providerAddress, balance) => {
        try {
            return await this.accountProcessor.addAccount(providerAddress, balance);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Retrieves the account information for a given provider address.
     *
     * @param providerAddress - The address of the provider identifying the account.
     *
     * @returns A promise that resolves to the account information.
     *
     * @throws Will throw an error if the account retrieval process fails.
     */
    getAccount = async (providerAddress) => {
        try {
            return await this.accountProcessor.getAccount(providerAddress);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Deposits a specified amount of funds into the given account.
     *
     * @param {string} account - The account identifier where the funds will be deposited.
     * @param {string} amount - The amount of funds to be deposited. Units are in A0GI.
     * @throws  An error if the deposit fails.
     */
    depositFund = async (account, amount) => {
        try {
            return await this.accountProcessor.depositFund(account, amount);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * Generates request metadata for the provider service.
     * Includes:
     * 1. Request endpoint for the provider service
     * 2. Model information for the provider service
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     *
     * @returns { endpoint, model } - Object containing endpoint and model.
     *
     * @throws An error if errors occur during the processing of the request.
     */
    getServiceMetadata = async (providerAddress, svcName) => {
        try {
            return await this.requestProcessor.getServiceMetadata(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * getRequestHeaders generates billing-related headers for the request
     * when the user uses the provider service.
     *
     * In the 0G Serving system, a request with valid billing headers
     * is considered a settlement proof and will be used by the provider
     * for contract settlement.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @param content - The content being billed. For example, in a chatbot service, it is the text input by the user.
     *
     * @returns headers. Records information such as the request fee and user signature.
     *
     * @example
     *
     * const { endpoint, model } = await broker.getServiceMetadata(
     *   providerAddress,
     *   serviceName,
     * );
     *
     * const headers = await broker.getServiceMetadata(
     *   providerAddress,
     *   serviceName,
     *   content,
     * );
     *
     * const openai = new OpenAI({
     *   baseURL: endpoint,
     *   apiKey: "",
     * });
     *
     * const completion = await openai.chat.completions.create(
     *   {
     *     messages: [{ role: "system", content }],
     *     model,
     *   },
     *   headers: {
     *     ...headers,
     *   },
     * );
     *
     * @throws An error if errors occur during the processing of the request.
     */
    getRequestHeaders = async (providerAddress, svcName, content) => {
        try {
            return await this.requestProcessor.getRequestHeaders(providerAddress, svcName, content);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * processResponse is used after the user successfully obtains a response from the provider service.
     *
     * It will settle the fee for the response content. Additionally, if the service is verifiable,
     * input the chat ID from the response and processResponse will determine the validity of the
     * returned content by checking the provider service's response and corresponding signature associated
     * with the chat ID.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @param content - The main content returned by the service. For example, in the case of a chatbot service,
     * it would be the response text.
     * @param chatID - Only for verifiable services. You can provide the chat ID obtained from the response to
     * automatically download the response signature. The function will verify the reliability of the response
     * using the service's signing address.
     *
     * @returns A boolean value. True indicates the returned content is valid, otherwise it is invalid.
     *
     * @throws An error if any issues occur during the processing of the response.
     */
    processResponse = async (providerAddress, svcName, content, chatID) => {
        try {
            return await this.responseProcessor.processResponse(providerAddress, svcName, content, chatID);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * verifyService is used to verify the reliability of the service.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     *
     * @returns A <boolean | null> value. True indicates the service is reliable, otherwise it is unreliable.
     *
     * @throws An error if errors occur during the verification process.
     */
    verifyService = async (providerAddress, svcName) => {
        try {
            return await this.verifier.verifyService(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * getSignerRaDownloadLink returns the download link for the Signer RA.
     *
     * It can be provided to users who wish to manually verify the Signer RA.
     *
     * @param providerAddress - provider address.
     * @param svcName - service name.
     *
     * @returns Download link.
     */
    getSignerRaDownloadLink = async (providerAddress, svcName) => {
        try {
            return await this.verifier.getSignerRaDownloadLink(providerAddress, svcName);
        }
        catch (error) {
            throw error;
        }
    };
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
    getChatSignatureDownloadLink = async (providerAddress, svcName, chatID) => {
        try {
            return await this.verifier.getChatSignatureDownloadLink(providerAddress, svcName, chatID);
        }
        catch (error) {
            throw error;
        }
    };
    /**
     * settleFee is used to settle the fee for the provider service.
     *
     * Normally, the fee for each request will be automatically settled in processResponse.
     * However, if processResponse fails due to network issues or other reasons,
     * you can manually call settleFee to settle the fee.
     *
     * @param providerAddress - The address of the provider.
     * @param svcName - The name of the service.
     * @param fee - The fee to be settled. The unit of the fee is neuron.
     * 1 A0GI = 1e18 neuron. To accommodate large values, it needs to use string type.
     *
     * @returns A promise that resolves when the fee settlement is successful.
     *
     * @throws An error if any issues occur during the fee settlement process.
     */
    settleFee = async (providerAddress, svcName, fee) => {
        try {
            if (!/^-?\d+$/.test(fee)) {
                throw new Error('Invalid input: The fee is not a valid integer representation');
            }
            return await this.responseProcessor.settleFee(providerAddress, svcName, BigInt(fee));
        }
        catch (error) {
            throw error;
        }
    };
}
/**
 * createZGServingNetworkBroker is used to initialize ZGServingUserBroker
 *
 * @param signer - Signer from ethers.js.
 * @param contractAddress - 0G Serving contract address, use default address if not provided.
 *
 * @returns broker instance.
 *
 * @throws An error if the broker cannot be initialized.
 */
async function createZGServingNetworkBroker(signer, contractAddress = '0x9Ae9b2C822beFF4B4466075006bc6b5ac35E779F') {
    const broker = new ZGServingNetworkBroker(signer, contractAddress);
    try {
        await broker.initialize();
        return broker;
    }
    catch (error) {
        throw error;
    }
}

export { AccountProcessor, ModelProcessor, RequestProcessor, ResponseProcessor, Verifier, ZGServingNetworkBroker, createZGServingNetworkBroker };
//# sourceMappingURL=index.mjs.map
