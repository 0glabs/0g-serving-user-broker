import {
    AddressLike,
    BigNumberish,
    JsonRpcSigner,
    Wallet,
    ethers,
} from 'ethers'
import { MESSAGE_FOR_ENCRYPTION_KEY } from './const'
import CryptoJS from 'crypto-js'
import { PrivateKey, decrypt } from 'eciesjs'
import * as crypto from 'crypto'

const ivLength: number = 12
const tagLength: number = 16
const sigLength: number = 65

// Inference
async function deriveEncryptionKey(
    signer: JsonRpcSigner | Wallet
): Promise<string> {
    const signature = await signer.signMessage(MESSAGE_FOR_ENCRYPTION_KEY)
    const hash = ethers.sha256(ethers.toUtf8Bytes(signature))
    return hash
}

export async function encryptData(
    signer: JsonRpcSigner | Wallet,
    data: string
): Promise<string> {
    const key = await deriveEncryptionKey(signer)
    const encrypted = CryptoJS.AES.encrypt(data, key).toString()
    return encrypted
}

export async function decryptData(
    signer: JsonRpcSigner | Wallet,
    encryptedData: string
): Promise<string> {
    const key = await deriveEncryptionKey(signer)
    const bytes = CryptoJS.AES.decrypt(encryptedData, key)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)
    return decrypted
}

// Fine-tuning

export async function signRequest(
    signer: Wallet,
    userAddress: AddressLike,
    nonce: BigNumberish,
    datasetRootHash: string,
    fee: BigNumberish
): Promise<string> {
    const hash = ethers.solidityPackedKeccak256(
        ['address', 'uint256', 'string', 'uint256'],
        [userAddress, nonce, datasetRootHash, fee]
    )

    return await signer.signMessage(ethers.toBeArray(hash))
}

export async function eciesDecrypt(
    signer: Wallet,
    encryptedData: string
): Promise<string> {
    encryptedData = encryptedData.startsWith('0x')
        ? encryptedData.slice(2)
        : encryptedData

    const privateKey = PrivateKey.fromHex(signer.privateKey)
    const data = Buffer.from(encryptedData, 'hex')
    const decrypted = decrypt(privateKey.secret, data)
    return decrypted.toString('hex')
}

export async function aesGCMDecrypt(
    key: string,
    data: Buffer<ArrayBufferLike>,
    providerSigner: string
): Promise<Buffer<ArrayBuffer>> {
    const iv = data.subarray(0, ivLength)
    const encryptedText = data.subarray(
        ivLength,
        data.length - tagLength - sigLength
    )
    const authTag = data.subarray(
        data.length - tagLength - sigLength,
        data.length - sigLength
    )
    const tagSig = data.subarray(data.length - sigLength, data.length)
    const recoveredAddress = ethers.recoverAddress(
        ethers.keccak256(authTag),
        '0x' + tagSig.toString('hex')
    )
    if (recoveredAddress.toLowerCase() !== providerSigner.toLowerCase()) {
        throw new Error('Invalid tag signature')
    }

    const privateKey = Buffer.from(key, 'hex')
    const decipher = crypto.createDecipheriv('aes-256-gcm', privateKey, iv)
    decipher.setAuthTag(authTag)

    let decrypted = Buffer.concat([
        decipher.update(encryptedText),
        decipher.final(),
    ])

    return decrypted
}
