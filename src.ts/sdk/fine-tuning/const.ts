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
export const MESSAGE_FOR_ENCRYPTION_KEY = 'MESSAGE_FOR_ENCRYPTION_KEY'

export const ZG_RPC_ENDPOINT_TESTNET = 'https://evmrpc-testnet.0g.ai'

export const INDEXER_URL_STANDARD =
    'https://indexer-storage-testnet-standard.0g.ai'
export const INDEXER_URL_TURBO = 'https://indexer-storage-testnet-turbo.0g.ai'

export const MODEL_HASH_MAP: {
    [key: string]: { [key: string]: string }
} = {
    'distilbert-base-uncased': {
        turbo: '0x7f2244b25cd2219dfd9d14c052982ecce409356e0f08e839b79796e270d110a7',
        standard: '',
        description:
            'DistilBERT is a transformers model, smaller and faster than BERT, which was pretrained on the same corpus in a self-supervised fashion, using the BERT base model as a teacher. More details can be found at: https://huggingface.co/distilbert/distilbert-base-uncased',
    },
    mobilenet_v2: {
        turbo: '0x8645816c17a8a70ebf32bcc7e621c659e8d0150b1a6bfca27f48f83010c6d12e',
        standard: '',
        description:
            'MobileNet V2 model pre-trained on ImageNet-1k at resolution 224x224. More details can be found at: https://huggingface.co/google/mobilenet_v2_1.0_224',
    },
    'deepseek-r1-distill-qwen-1.5b': {
        turbo: '0x2084fdd904c9a3317dde98147d4e7778a40e076b5b0eb469f7a8f27ae5b13e7f',
        standard: '',
        description:
            'DeepSeek-R1-Zero, a model trained via large-scale reinforcement learning (RL) without supervised fine-tuning (SFT) as a preliminary step, demonstrated remarkable performance on reasoning. More details can be found at: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B',
    },
    'cocktailsgd-opt-1.3b': {
        turbo: '0xe25963fd25fe37d7df5216de1eae533ea42090d3642c3f84edd0f179ffc63a94,0xfccaf17bd0ed26b74e8a3883f5c814bcb5f247015d68fd65a28bf98e1bdb0b7f',
        standard: '',
        description: 'CocktailSGD-opt-1.3B finetunes the Opt-1.3B langauge model with CocktailSGD, which is a novel distributed finetuning framework. More details can be found at: https://github.com/DS3Lab/CocktailSGD'
    },
    // TODO: remove
    'mock-model': {
        turbo: '0xf463fe8c26e7dbca20716eb3c81ac1f3ea23a6c5dbe002bf46507db403c71578',
        standard: '',
        description: '',
    },
}
