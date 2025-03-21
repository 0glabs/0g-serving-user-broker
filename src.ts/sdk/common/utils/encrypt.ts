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
import { promises as fs } from 'fs'

const ivLength: number = 12
const tagLength: number = 16
const sigLength: number = 65
const chunkLength: number = 64 * 1024 * 1024 + tagLength

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

export function hexToRoots(hexString: string): string {
    if (hexString.startsWith('0x')) {
        hexString = hexString.slice(2)
    }
    return Buffer.from(hexString, 'hex').toString('utf8')
}

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
    data: Buffer,
    providerSigner: string
): Promise<Buffer> {
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

export async function aesGCMDecryptToFile(
    key: string,
    encryptedModelPath: string,
    decryptedModelPath: string,
    providerSigner: string
) {
    const fd = await fs.open(encryptedModelPath, 'r')

    // read signature and nonce
    const tagSig = Buffer.alloc(sigLength)
    const iv = Buffer.alloc(ivLength)

    let offset = 0
    let readResult = await fd.read(tagSig, 0, sigLength, offset)
    offset += readResult.bytesRead

    readResult = await fd.read(iv, 0, ivLength, offset)
    offset += readResult.bytesRead

    const privateKey = Buffer.from(key, 'hex')
    const buffer = Buffer.alloc(chunkLength)
    let tagsBuffer = Buffer.from([])

    const writeFd = await fs.open(decryptedModelPath, 'w')

    // read chunks
    while (true) {
        readResult = await fd.read(buffer, 0, chunkLength, offset)
        let chunkSize = readResult.bytesRead
        if (chunkSize === 0) {
            break
        }
        const decipher = crypto.createDecipheriv('aes-256-gcm', privateKey, iv)
        const tag = buffer.subarray(chunkSize - tagLength, chunkSize)
        decipher.setAuthTag(tag)

        let decrypted = Buffer.concat([
            decipher.update(buffer.subarray(0, chunkSize - tagLength)),
            decipher.final(),
        ])

        await writeFd.appendFile(decrypted)

        tagsBuffer = Buffer.concat([tagsBuffer, tag])
        offset += chunkSize

        for (let i = iv.length - 1; i >= 0; i--) {
            iv[i]++
            if (iv[i] !== 0) break
        }
    }

    await writeFd.close()
    await fd.close()

    const recoveredAddress = ethers.recoverAddress(
        ethers.keccak256(tagsBuffer),
        '0x' + tagSig.toString('hex')
    )

    if (recoveredAddress.toLowerCase() !== providerSigner.toLowerCase()) {
        throw new Error('Invalid tag signature')
    }
}
