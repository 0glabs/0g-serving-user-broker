import { JsonRpcSigner, Wallet, ethers } from 'ethers'
import { MESSAGE_FOR_ENCRYPTION_KEY } from './const'
import CryptoJS from 'crypto-js'
import { PrivateKey, decrypt } from 'eciesjs'
import * as crypto from 'crypto'

const ivLength: number = 12
const tagLength: number = 16
const sigLength: number = 65

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

export async function eciesDecrypt(
    signer: Wallet,
    encryptedData: string
): Promise<string> {
    const privateKey = PrivateKey.fromHex(signer.privateKey)
    const data = Buffer.from(encryptedData, 'hex')
    const decrypted = decrypt(privateKey.secret, data)
    return decrypted.toString('hex')
}

export async function aesGCMDecrypt(
    key: string,
    encryptedData: string,
    providerAddress: string
): Promise<string> {
    const data = Buffer.from(encryptedData, 'hex')
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
        tagSig.toString('hex')
    )
    if (recoveredAddress.toLowerCase() !== providerAddress.toLowerCase()) {
        throw new Error('Invalid tag signature')
    }

    const privateKey = Buffer.from(key, 'hex')

    const decipher = crypto.createDecipheriv('aes-256-gcm', privateKey, iv)
    decipher.setAuthTag(authTag)
    let decrypted = decipher.update(
        encryptedText.toString('hex'),
        'hex',
        'utf8'
    )
    decrypted += decipher.final('utf8')
    return decrypted
}
