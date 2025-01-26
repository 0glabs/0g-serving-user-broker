"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODEL_HASH_MAP = exports.INDEXER_URL_TURBO = exports.INDEXER_URL_STANDARD = exports.ZG_RPC_ENDPOINT_TESTNET = exports.MESSAGE_FOR_ENCRYPTION_KEY = void 0;
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
exports.MESSAGE_FOR_ENCRYPTION_KEY = 'MESSAGE_FOR_ENCRYPTION_KEY';
exports.ZG_RPC_ENDPOINT_TESTNET = 'https://evmrpc-testnet.0g.ai';
exports.INDEXER_URL_STANDARD = 'https://indexer-storage-testnet-standard.0g.ai';
exports.INDEXER_URL_TURBO = 'https://indexer-storage-testnet-turbo.0g.ai';
exports.MODEL_HASH_MAP = {
    'distilbert-base-uncased': {
        turbo: '0x7f2244b25cd2219dfd9d14c052982ecce409356e0f08e839b79796e270d110a7',
        standard: '',
        description: 'DistilBERT is a transformers model, smaller and faster than BERT, which was pretrained on the same corpus in a self-supervised fashion, using the BERT base model as a teacher. More details can be found at: https://huggingface.co/distilbert/distilbert-base-uncased',
    },
    mobilenet_v2: {
        turbo: '0x8645816c17a8a70ebf32bcc7e621c659e8d0150b1a6bfca27f48f83010c6d12e',
        standard: '',
        description: 'MobileNet V2 model pre-trained on ImageNet-1k at resolution 224x224. More details can be found at: https://huggingface.co/google/mobilenet_v2_1.0_224',
    },
    // TODO: remove
    'mock-model': {
        turbo: '0xf463fe8c26e7dbca20716eb3c81ac1f3ea23a6c5dbe002bf46507db403c71578',
        standard: '',
        description: '',
    },
};
//# sourceMappingURL=const.js.map