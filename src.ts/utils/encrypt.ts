import { JsonRpcSigner, Wallet, ethers } from 'ethers'
import { MESSAGE_FOR_ENCRYPTION_KEY } from '../const'
import CryptoJS from 'crypto-js'

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
