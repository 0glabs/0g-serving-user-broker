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
                if (!error.message.includes('AccountNotExists')) {
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
        name: "AccountNotExists",
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
                name: "provider",
                type: "address",
            },
            {
                internalType: "string",
                name: "name",
                type: "string",
            },
        ],
        name: "ServiceNotExist",
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
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
        ],
        name: "accountExists",
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
                name: "user",
                type: "address",
            },
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
                name: "user",
                type: "address",
            },
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
                name: "_ledgerAddress",
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
        name: "ledgerAddress",
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
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
        ],
        name: "processRefund",
        outputs: [
            {
                internalType: "uint256",
                name: "totalAmount",
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
        ],
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
                name: "user",
                type: "address",
            },
            {
                internalType: "address",
                name: "provider",
                type: "address",
            },
        ],
        name: "requestRefundAll",
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
const _bytecode = "0x60806040523480156200001157600080fd5b506200001d3362000023565b62000073565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b61341c80620000836000396000f3fe6080604052600436106101405760003560e01c80636c79158d116100b6578063972167251161006f57806397216725146103a2578063d1d20056146103c2578063f2fde38b146103e2578063f51acaea14610402578063fbfa4e1114610422578063fd5908471461044257600080fd5b80636c79158d146102ef578063715018a61461030f578063746e78d714610324578063754d1d541461034457806378c00436146103645780638da5cb5b1461038457600080fd5b806321fe0f301161010857806321fe0f3014610212578063371c22c5146102345780633f54d9731461026c5780634bc3aff4146102815780634e3c4f22146102945780636341b2d1146102cf57600080fd5b806308e93d0a146101455780630d668087146101705780630e61d15814610194578063147500e3146101c1578063158ef93e146101f1575b600080fd5b34801561015157600080fd5b5061015a61046f565b6040516101679190612a5f565b60405180910390f35b34801561017c57600080fd5b5061018660015481565b604051908152602001610167565b3480156101a057600080fd5b506101b46101af366004612b80565b610480565b6040516101679190612c88565b3480156101cd57600080fd5b506101e16101dc366004612c9b565b6107b5565b6040519015158152602001610167565b3480156101fd57600080fd5b506000546101e190600160a01b900460ff1681565b34801561021e57600080fd5b506102276107cc565b6040516101679190612cce565b34801561024057600080fd5b50600254610254906001600160a01b031681565b6040516001600160a01b039091168152602001610167565b61027f61027a366004612c9b565b6107d8565b005b61027f61028f366004612d23565b610869565b3480156102a057600080fd5b506102b46102af366004612c9b565b6108f5565b60408051938452602084019290925290820152606001610167565b3480156102db57600080fd5b5061027f6102ea366004612de0565b6109cc565b3480156102fb57600080fd5b5061027f61030a366004612c9b565b610af7565b34801561031b57600080fd5b5061027f610b31565b34801561033057600080fd5b5061027f61033f366004612ed5565b610b45565b34801561035057600080fd5b5061027f61035f366004612ef0565b610b79565b34801561037057600080fd5b5061027f61037f366004612f3d565b610c49565b34801561039057600080fd5b506000546001600160a01b0316610254565b3480156103ae57600080fd5b5061027f6103bd366004612c9b565b611261565b3480156103ce57600080fd5b50600354610254906001600160a01b031681565b3480156103ee57600080fd5b5061027f6103fd366004612ed5565b611297565b34801561040e57600080fd5b5061027f61041d366004612f7f565b611310565b34801561042e57600080fd5b5061027f61043d366004612fb4565b61135f565b34801561044e57600080fd5b5061046261045d366004612c9b565b61136c565b6040516101679190612fcd565b606061047b600661148f565b905090565b61048861275b565b610494600984846116d0565b60408051610120810190915281546001600160a01b031681526001820180549192916020840191906104c590612fe0565b80601f01602080910402602001604051908101604052809291908181526020018280546104f190612fe0565b801561053e5780601f106105135761010080835404028352916020019161053e565b820191906000526020600020905b81548152906001019060200180831161052157829003601f168201915b5050505050815260200160028201805461055790612fe0565b80601f016020809104026020016040519081016040528092919081815260200182805461058390612fe0565b80156105d05780601f106105a5576101008083540402835291602001916105d0565b820191906000526020600020905b8154815290600101906020018083116105b357829003601f168201915b505050505081526020016003820180546105e990612fe0565b80601f016020809104026020016040519081016040528092919081815260200182805461061590612fe0565b80156106625780601f1061063757610100808354040283529160200191610662565b820191906000526020600020905b81548152906001019060200180831161064557829003601f168201915b5050505050815260200160048201548152602001600582015481526020016006820154815260200160078201805461069990612fe0565b80601f01602080910402602001604051908101604052809291908181526020018280546106c590612fe0565b80156107125780601f106106e757610100808354040283529160200191610712565b820191906000526020600020905b8154815290600101906020018083116106f557829003601f168201915b5050505050815260200160088201805461072b90612fe0565b80601f016020809104026020016040519081016040528092919081815260200182805461075790612fe0565b80156107a45780601f10610779576101008083540402835291602001916107a4565b820191906000526020600020905b81548152906001019060200180831161078757829003601f168201915b505050505081525050905092915050565b60006107c3600684846116e5565b90505b92915050565b606061047b60096116fa565b6003546001600160a01b0316331461080b5760405162461bcd60e51b81526004016108029061301a565b60405180910390fd5b60008061081b6006858534611aba565b91509150826001600160a01b0316846001600160a01b03166000805160206133c7833981519152848460405161085b929190918252602082015260400190565b60405180910390a350505050565b6003546001600160a01b031633146108935760405162461bcd60e51b81526004016108029061301a565b6000806108a560068787873488611b46565b91509150846001600160a01b0316866001600160a01b03166000805160206133c783398151915284846040516108e5929190918252602082015260400190565b60405180910390a3505050505050565b600354600090819081906001600160a01b031633146109265760405162461bcd60e51b81526004016108029061301a565b6001546109399060069087908790611bb1565b91945092509050600083900361095257600092506109c5565b604051339084156108fc029085906000818181858888f1935050505015801561097f573d6000803e3d6000fd5b50836001600160a01b0316856001600160a01b03166000805160206133c783398151915284846040516109bc929190918252602082015260400190565b60405180910390a35b9250925092565b610a82338b8b8b8b8080601f01602080910402602001604051908101604052809392919081815260200183838082843760009201919091525050604080516020601f8f018190048102820181019092528d815292508d91508c908190840183828082843760009201919091525050604080516020601f8e018190048102820181019092528c815292508c91508b9081908401838280828437600092019190915250600998979695949392508b91508a9050611cec565b89604051610a90919061305b565b6040518091039020336001600160a01b03167f95e1ef74a36b7d6ac766d338a4468c685d593739c3b7dc39e2aa5921a1e139328b8b8b8787428e8e8e8e604051610ae39a999897969594939291906130a0565b60405180910390a350505050505050505050565b6003546001600160a01b03163314610b215760405162461bcd60e51b81526004016108029061301a565b610b2d60068383611dde565b5050565b610b39611e9f565b610b436000611ef9565b565b610b4d611e9f565b600280546001600160a01b039092166001600160a01b0319928316811790915560048054909216179055565b600054600160a01b900460ff1615610bde5760405162461bcd60e51b815260206004820152602260248201527f496e697469616c697a61626c653a20616c726561647920696e697469616c697a604482015261195960f21b6064820152608401610802565b6000805460ff60a01b1916600160a01b179055610bfa81611ef9565b50600192909255600280546001600160a01b039283166001600160a01b031991821681179092556003805493909416928116831790935560058054841690921790915560048054909216179055565b6004546000906001600160a01b031663ad12259a610c678480613113565b610c746020870187613113565b87604001356040518663ffffffff1660e01b8152600401610c9995949392919061318f565b602060405180830381865afa158015610cb6573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610cda91906131c9565b905080610d2a5760405163885e287960e01b815260206004820152601f60248201527f5a4b20736574746c656d656e742076616c69646174696f6e206661696c6564006044820152606401610802565b6000610d396020840184613113565b808060200260200160405190810160405280939291908181526020018383602002808284376000920182905250939450339250839150505b610d7e6060870187613113565b90508110156111eb576000610d966060880188613113565b83818110610da657610da66131eb565b90506020020135905060008185610dbd9190613217565b9050600080878781518110610dd457610dd46131eb565b60200260200101519050600088886002610dee9190613217565b81518110610dfe57610dfe6131eb565b60200260200101519050600089896003610e189190613217565b81518110610e2857610e286131eb565b602002602001015190506000610e4a84336006611f499092919063ffffffff16565b90508a610e588b6005613217565b81518110610e6857610e686131eb565b602002602001015181600501600060028110610e8657610e866131eb565b0154141580610ecf57508a610e9c8b6006613217565b81518110610eac57610eac6131eb565b602002602001015181600501600160028110610eca57610eca6131eb565b015414155b15610f1d5760405163885e287960e01b815260206004820152601760248201527f7369676e6572206b657920697320696e636f72726563740000000000000000006044820152606401610802565b8281600201541115610f725760405163885e287960e01b815260206004820152601a60248201527f696e697469616c206e6f6e636520697320696e636f72726563740000000000006044820152606401610802565b895b868110156111745760008c8281518110610f9057610f906131eb565b6020026020010151905060008d836001610faa9190613217565b81518110610fba57610fba6131eb565b602002602001015190508d836003610fd29190613217565b81518110610fe257610fe26131eb565b6020026020010151945060008e846004610ffc9190613217565b8151811061100c5761100c6131eb565b6020026020010151905060008a8560096110269190613217565b10611032576000611057565b8f61103e866009613217565b8151811061104e5761104e6131eb565b60200260200101515b905080158015906110685750808710155b156110a95760405163885e287960e01b815260206004820152601060248201526f1b9bdb98d9481bdd995c9b185c1c195960821b6044820152606401610802565b88841415806110b857508d8314155b15611150578884036110ff576040518060400160405280601d81526020017f70726f7669646572206164647265737320697320696e636f7272656374000000815250611136565b6040518060400160405280601981526020017f75736572206164647265737320697320696e636f7272656374000000000000008152505b60405163885e287960e01b8152600401610802919061322a565b61115a828b613217565b99505050505060078161116d9190613217565b9050610f74565b5084816003015410156111c15760405163885e287960e01b8152602060048201526014602482015273696e73756666696369656e742062616c616e636560601b6044820152606401610802565b6111cb8186611f56565b60020155509195508392506111e3915082905061323d565b915050610d71565b508251821461125a5760405163885e287960e01b815260206004820152603460248201527f6172726179207365676d656e7453697a652073756d206d69736d617463686573604482015273040e0eac4d8d2c640d2dce0eae840d8cadccee8d60631b6064820152608401610802565b5050505050565b6003546001600160a01b0316331461128b5760405162461bcd60e51b81526004016108029061301a565b610b2d600683836121c3565b61129f611e9f565b6001600160a01b0381166113045760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610802565b61130d81611ef9565b50565b61131c60093383612263565b8060405161132a919061305b565b6040519081900381209033907f68026479739e3662c0651578523384b94455e79bfb701ce111a3164591ceba7390600090a350565b611367611e9f565b600155565b6113746127b0565b61138060068484611f49565b604080516101008101825282546001600160a01b039081168252600184015416602082015260028084015482840152600384015460608301526004840154608083015282518084019384905291939260a085019291600585019182845b8154815260200190600101908083116113dd575050505050815260200160078201805480602002602001604051908101604052809291908181526020016000905b82821015611477576000848152602090819020604080516080810182526004860290920180548352600180820154848601526002820154928401929092526003015460ff1615156060830152908352909201910161141e565b50505050815260200160088201805461072b90612fe0565b6060600061149c836122a6565b90508067ffffffffffffffff8111156114b7576114b7612add565b6040519080825280602002602001820160405280156114f057816020015b6114dd6127b0565b8152602001906001900390816114d55790505b50915060005b818110156116c95761150884826122b1565b604080516101008101825282546001600160a01b039081168252600184015416602082015260028084015482840152600384015460608301526004840154608083015282518084019384905291939260a085019291600585019182845b815481526020019060010190808311611565575050505050815260200160078201805480602002602001604051908101604052809291908181526020016000905b828210156115ff576000848152602090819020604080516080810182526004860290920180548352600180820154848601526002820154928401929092526003015460ff161515606083015290835290920191016115a6565b50505050815260200160088201805461161790612fe0565b80601f016020809104026020016040519081016040528092919081815260200182805461164390612fe0565b80156116905780601f1061166557610100808354040283529160200191611690565b820191906000526020600020905b81548152906001019060200180831161167357829003601f168201915b5050505050815250508382815181106116ab576116ab6131eb565b602002602001018190525080806116c19061323d565b9150506114f6565b5050919050565b60006116dd8484846122d7565b949350505050565b60006116dd846116f5858561232b565b61236d565b60606000611707836122a6565b90508067ffffffffffffffff81111561172257611722612add565b60405190808252806020026020018201604052801561175b57816020015b61174861275b565b8152602001906001900390816117405790505b50915060005b818110156116c95761177384826122b1565b60408051610120810190915281546001600160a01b031681526001820180549192916020840191906117a490612fe0565b80601f01602080910402602001604051908101604052809291908181526020018280546117d090612fe0565b801561181d5780601f106117f25761010080835404028352916020019161181d565b820191906000526020600020905b81548152906001019060200180831161180057829003601f168201915b5050505050815260200160028201805461183690612fe0565b80601f016020809104026020016040519081016040528092919081815260200182805461186290612fe0565b80156118af5780601f10611884576101008083540402835291602001916118af565b820191906000526020600020905b81548152906001019060200180831161189257829003601f168201915b505050505081526020016003820180546118c890612fe0565b80601f01602080910402602001604051908101604052809291908181526020018280546118f490612fe0565b80156119415780601f1061191657610100808354040283529160200191611941565b820191906000526020600020905b81548152906001019060200180831161192457829003601f168201915b5050505050815260200160048201548152602001600582015481526020016006820154815260200160078201805461197890612fe0565b80601f01602080910402602001604051908101604052809291908181526020018280546119a490612fe0565b80156119f15780601f106119c6576101008083540402835291602001916119f1565b820191906000526020600020905b8154815290600101906020018083116119d457829003601f168201915b50505050508152602001600882018054611a0a90612fe0565b80601f0160208091040260200160405190810160405280929190818152602001828054611a3690612fe0565b8015611a835780601f10611a5857610100808354040283529160200191611a83565b820191906000526020600020905b815481529060010190602001808311611a6657829003601f168201915b505050505081525050838281518110611a9e57611a9e6131eb565b602002602001018190525080611ab39061323d565b9050611761565b6000806000611ac9868661232b565b9050611ad5878261236d565b611b055760405163023280eb60e21b81526001600160a01b03808816600483015286166024820152604401610802565b6000611b12888888612379565b905084816003016000828254611b289190613217565b90915550506003810154600490910154909890975095505050505050565b6000806000611b55888861232b565b9050611b61898261236d565b15611b9257604051632cf0675960e21b81526001600160a01b03808a16600483015288166024820152604401610802565b611ba189828a8a8a8a8a6123d3565b5092976000975095505050505050565b600080600080611bc2888888612379565b90506000935060005b6007820154811015611cd2576000826007018281548110611bee57611bee6131eb565b60009182526020909120600490910201600381015490915060ff1615611c145750611cc0565b868160020154611c249190613217565b421015611c315750611cc0565b8060010154836003016000828254611c499190613256565b90915550506001810154600484018054600090611c67908490613256565b909155505060078301805483908110611c8257611c826131eb565b60009182526020822060049091020181815560018082018390556002820192909255600301805460ff19169055810154611cbc9087613217565b9550505b80611cca8161323d565b915050611bcb565b508060030154925080600401549150509450945094915050565b6000611cf88989612443565b9050611d048a8261236d565b611d6257611d5b8a826040518061012001604052808d6001600160a01b031681526020018c81526020018b81526020018a815260200187815260200186815260200142815260200189815260200188815250612458565b5050611dd3565b6000611d6f8b8b8b6122d7565b905060018101611d7f8a826132af565b5060028101611d8e89826132af565b50600481018490556005810183905560038101611dab88826132af565b5042600682015560078101611dc087826132af565b5060088101611dcf86826132af565b5050505b505050505050505050565b6000611deb848484612379565b9050600081600401548260030154611e039190613256565b905080600003611e14575050505050565b6040805160808101825260078401805480835260208084018681524295850195865260006060860181815260018086018755958252928120955160049485029096019586559051938501939093559351600284015592516003909201805460ff1916921515929092179091559083018054839290611e93908490613217565b90915550505050505050565b6000546001600160a01b03163314610b435760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610802565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b60006116dd848484612379565b81600401548260030154611f6a9190613256565b8111156120cf57600082600401548360030154611f879190613256565b611f919083613256565b90508083600401541015611ff65760405163885e287960e01b815260206004820152602560248201527f696e73756666696369656e742062616c616e636520696e2070656e64696e675260448201526419599d5b9960da1b6064820152608401610802565b8083600401600082825461200a9190613256565b9091555050600783015460009061202390600190613256565b90505b600081126120cc576000846007018281548110612045576120456131eb565b60009182526020909120600490910201600381015490915060ff161561206b57506120ba565b8281600101541161208c5760018101546120859084613256565b92506120aa565b828160010160008282546120a09190613256565b9091555060009350505b826000036120b857506120cc565b505b806120c48161336f565b915050612026565b50505b808260030160008282546120e39190613256565b90915550506005548254604051631bb1482360e31b81526001600160a01b0391821660048201526024810184905291169063dd8a411890604401600060405180830381600087803b15801561213757600080fd5b505af115801561214b573d6000803e3d6000fd5b50508354600385015460048601546040805192835260208301919091523394506001600160a01b0390921692506000805160206133c7833981519152910160405180910390a3604051339082156108fc029083906000818181858888f193505050501580156121be573d6000803e3d6000fd5b505050565b60006121cf838361232b565b90506121db848261236d565b6121e55750505050565b6121ef848261251e565b50600081815260028086016020526040822080546001600160a01b031990811682556001820180549091169055908101829055600381018290556004810182905560058101829055600681018290559061224d60078301600061280d565b61225b60088301600061282e565b505050505050565b600061226f8383612443565b905061227b848261236d565b61229c578282604051636e41f4cf60e11b815260040161080292919061338c565b61125a848261252a565b60006107c6826125b5565b6000806122be84846125bf565b6000908152600285016020526040902091505092915050565b6000806122e48484612443565b60008181526002870160205260409020909150612301868361236d565b612322578484604051636e41f4cf60e11b815260040161080292919061338c565b95945050505050565b604080516001600160a01b0380851660208301528316918101919091526000906060015b60405160208183030381529060405280519060200120905092915050565b60006107c383836125cb565b600080612386848461232b565b600081815260028701602052604090209091506123a3868361236d565b6123225760405163023280eb60e21b81526001600160a01b03808716600483015285166024820152604401610802565b6000868152600280890160205260409091206003810184905580546001600160a01b038089166001600160a01b031992831617835560018301805491891691909216179055906124299060058301908690612868565b506008810161243883826132af565b50611dd388886125e3565b6000828260405160200161234f92919061338c565b600082815260028401602090815260408220835181546001600160a01b0319166001600160a01b0390911617815590830151839190600182019061249c90826132af565b50604082015160028201906124b190826132af565b50606082015160038201906124c690826132af565b506080820151600482015560a0820151600582015560c0820151600682015560e082015160078201906124f990826132af565b50610100820151600882019061250f90826132af565b506116dd9150859050846125e3565b60006107c383836125ef565b6000818152600283016020526040812080546001600160a01b031916815581612556600183018261282e565b61256460028301600061282e565b61257260038301600061282e565b60048201600090556005820160009055600682016000905560078201600061259a919061282e565b6125a860088301600061282e565b506107c39050838361251e565b60006107c6825490565b60006107c383836126e2565b600081815260018301602052604081205415156107c3565b60006107c3838361270c565b600081815260018301602052604081205480156126d8576000612613600183613256565b855490915060009061262790600190613256565b905081811461268c576000866000018281548110612647576126476131eb565b906000526020600020015490508087600001848154811061266a5761266a6131eb565b6000918252602080832090910192909255918252600188019052604090208390555b855486908061269d5761269d6133b0565b6001900381819060005260206000200160009055905585600101600086815260200190815260200160002060009055600193505050506107c6565b60009150506107c6565b60008260000182815481106126f9576126f96131eb565b9060005260206000200154905092915050565b6000818152600183016020526040812054612753575081546001818101845560008481526020808220909301849055845484825282860190935260409020919091556107c6565b5060006107c6565b60405180610120016040528060006001600160a01b0316815260200160608152602001606081526020016060815260200160008152602001600081526020016000815260200160608152602001606081525090565b60405180610100016040528060006001600160a01b0316815260200160006001600160a01b031681526020016000815260200160008152602001600081526020016127f96128a6565b815260200160608152602001606081525090565b508054600082556004029060005260206000209081019061130d91906128c4565b50805461283a90612fe0565b6000825580601f1061284a575050565b601f01602090049060005260206000209081019061130d91906128f2565b8260028101928215612896579160200282015b8281111561289657823582559160200191906001019061287b565b506128a29291506128f2565b5090565b60405180604001604052806002906020820280368337509192915050565b5b808211156128a257600080825560018201819055600282015560038101805460ff191690556004016128c5565b5b808211156128a257600081556001016128f3565b8060005b600281101561292a57815184526020938401939091019060010161290b565b50505050565b600081518084526020808501945080840160005b838110156129825781518051885283810151848901526040808201519089015260609081015115159088015260809096019590820190600101612944565b509495945050505050565b60005b838110156129a8578181015183820152602001612990565b50506000910152565b600081518084526129c981602086016020860161298d565b601f01601f19169290920160200192915050565b600061012060018060a01b038084511685528060208501511660208601525060408301516040850152606083015160608501526080830151608085015260a0830151612a2c60a0860182612907565b5060c08301518160e0860152612a4482860182612930565b91505060e083015184820361010086015261232282826129b1565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b82811015612ab457603f19888603018452612aa28583516129dd565b94509285019290850190600101612a86565b5092979650505050505050565b80356001600160a01b0381168114612ad857600080fd5b919050565b634e487b7160e01b600052604160045260246000fd5b600082601f830112612b0457600080fd5b813567ffffffffffffffff80821115612b1f57612b1f612add565b604051601f8301601f19908116603f01168101908282118183101715612b4757612b47612add565b81604052838152866020858801011115612b6057600080fd5b836020870160208301376000602085830101528094505050505092915050565b60008060408385031215612b9357600080fd5b612b9c83612ac1565b9150602083013567ffffffffffffffff811115612bb857600080fd5b612bc485828601612af3565b9150509250929050565b80516001600160a01b0316825260006101206020830151816020860152612bf7828601826129b1565b91505060408301518482036040860152612c1182826129b1565b91505060608301518482036060860152612c2b82826129b1565b9150506080830151608085015260a083015160a085015260c083015160c085015260e083015184820360e0860152612c6382826129b1565b9150506101008084015185830382870152612c7e83826129b1565b9695505050505050565b6020815260006107c36020830184612bce565b60008060408385031215612cae57600080fd5b612cb783612ac1565b9150612cc560208401612ac1565b90509250929050565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b82811015612ab457603f19888603018452612d11858351612bce565b94509285019290850190600101612cf5565b60008060008060a08587031215612d3957600080fd5b612d4285612ac1565b9350612d5060208601612ac1565b92506080850186811115612d6357600080fd5b6040860192503567ffffffffffffffff811115612d7f57600080fd5b612d8b87828801612af3565b91505092959194509250565b60008083601f840112612da957600080fd5b50813567ffffffffffffffff811115612dc157600080fd5b602083019150836020828501011115612dd957600080fd5b9250929050565b60008060008060008060008060008060e08b8d031215612dff57600080fd5b8a3567ffffffffffffffff80821115612e1757600080fd5b612e238e838f01612af3565b9b5060208d0135915080821115612e3957600080fd5b612e458e838f01612af3565b9a5060408d0135915080821115612e5b57600080fd5b612e678e838f01612d97565b909a50985060608d0135915080821115612e8057600080fd5b612e8c8e838f01612d97565b909850965060808d0135915080821115612ea557600080fd5b50612eb28d828e01612d97565b9b9e9a9d50989b979a969995989760a08101359660c09091013595509350505050565b600060208284031215612ee757600080fd5b6107c382612ac1565b60008060008060808587031215612f0657600080fd5b84359350612f1660208601612ac1565b9250612f2460408601612ac1565b9150612f3260608601612ac1565b905092959194509250565b600060208284031215612f4f57600080fd5b813567ffffffffffffffff811115612f6657600080fd5b820160808185031215612f7857600080fd5b9392505050565b600060208284031215612f9157600080fd5b813567ffffffffffffffff811115612fa857600080fd5b6116dd84828501612af3565b600060208284031215612fc657600080fd5b5035919050565b6020815260006107c360208301846129dd565b600181811c90821680612ff457607f821691505b60208210810361301457634e487b7160e01b600052602260045260246000fd5b50919050565b60208082526021908201527f43616c6c6572206973206e6f7420746865206c656467657220636f6e747261636040820152601d60fa1b606082015260800190565b6000825161306d81846020870161298d565b9190910192915050565b81835281816020850137506000828201602090810191909152601f909101601f19169091010190565b60e0815260006130b360e083018d6129b1565b82810360208401526130c6818c8e613077565b905089604084015288606084015287608084015282810360a08401526130ed818789613077565b905082810360c0840152613102818587613077565b9d9c50505050505050505050505050565b6000808335601e1984360301811261312a57600080fd5b83018035915067ffffffffffffffff82111561314557600080fd5b6020019150600581901b3603821315612dd957600080fd5b81835260006001600160fb1b0383111561317657600080fd5b8260051b80836020870137939093016020019392505050565b6060815260006131a360608301878961315d565b82810360208401526131b681868861315d565b9150508260408301529695505050505050565b6000602082840312156131db57600080fd5b81518015158114612f7857600080fd5b634e487b7160e01b600052603260045260246000fd5b634e487b7160e01b600052601160045260246000fd5b808201808211156107c6576107c6613201565b6020815260006107c360208301846129b1565b60006001820161324f5761324f613201565b5060010190565b818103818111156107c6576107c6613201565b601f8211156121be57600081815260208120601f850160051c810160208610156132905750805b601f850160051c820191505b8181101561225b5782815560010161329c565b815167ffffffffffffffff8111156132c9576132c9612add565b6132dd816132d78454612fe0565b84613269565b602080601f83116001811461331257600084156132fa5750858301515b600019600386901b1c1916600185901b17855561225b565b600085815260208120601f198616915b8281101561334157888601518255948401946001909101908401613322565b508582101561335f5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6000600160ff1b820161338457613384613201565b506000190190565b6001600160a01b03831681526040602082018190526000906116dd908301846129b1565b634e487b7160e01b600052603160045260246000fdfe526824944047da5b81071fb6349412005c5da81380b336103fbe5dd34556c776a2646970667358221220b01b1c58bdfa2c5cf460fbc78f532e0c6428fcea6f2c616b7abe297bdcbddada64736f6c63430008140033";
const isSuperArgs = (xs) => xs.length > 1;
class InferenceServing__factory extends ContractFactory {
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

class InferenceServingContract {
    serving;
    signer;
    _userAddress;
    constructor(signer, contractAddress, userAddress) {
        this.serving = InferenceServing__factory.connect(contractAddress, signer);
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
            const user = this.getUserAddress();
            const tx = await this.serving.deleteAccount(user, provider);
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
            const user = this.getUserAddress();
            const tx = await this.serving.addAccount(user, providerAddress, signer, settleSignerEncryptedPrivateKey, {
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
            const user = this.getUserAddress();
            const tx = await this.serving.depositFund(user, providerAddress, {
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
    async settleFeeWithA0gi(providerAddress, serviceName, fee) {
        if (!fee) {
            return;
        }
        await this.settleFee(providerAddress, serviceName, this.a0giToNeuron(fee));
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
        const contract = new InferenceServingContract(this.signer, this.contractAddress, userAddress);
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
     * @param {string} providerAddress - The address of the provider for whom the account is being created.
     * @param {number} balance - The initial balance to be assigned to the new account. Units are in A0GI.
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
     * @param {string} providerAddress - The address of the provider identifying the account.
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
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
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
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     * @param {string} content - The content being billed. For example, in a chatbot service, it is the text input by the user.
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
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     * @param {string} content - The main content returned by the service. For example, in the case of a chatbot service,
     * it would be the response text.
     * @param {string} chatID - Only for verifiable services. You can provide the chat ID obtained from the response to
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
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
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
     * @param {string} providerAddress - provider address.
     * @param {string} svcName - service name.
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
     * @param {string} providerAddress - provider address.
     * @param {string} svcName - service name.
     * @param {string} chatID - ID of the chat.
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
     * @param {string} providerAddress - The address of the provider.
     * @param {string} svcName - The name of the service.
     * @param {number} fee - The fee to be settled. The unit of the fee is A0GI.
     *
     * @returns A promise that resolves when the fee settlement is successful.
     *
     * @throws An error if any issues occur during the fee settlement process.
     */
    settleFee = async (providerAddress, svcName, fee) => {
        try {
            return await this.responseProcessor.settleFeeWithA0gi(providerAddress, svcName, fee);
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
async function createZGServingNetworkBroker(signer, contractAddress = '0xE7F0998C83a81f04871BEdfD89aB5f2DAcDBf435') {
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
