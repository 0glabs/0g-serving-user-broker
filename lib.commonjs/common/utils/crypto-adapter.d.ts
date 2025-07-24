/**
 * Crypto adapter that provides unified encryption/decryption interface
 * for both Node.js and browser environments
 */
export interface CryptoAdapter {
    aesGCMEncrypt(key: Buffer, data: Buffer, iv: Buffer): Promise<{
        encrypted: Buffer;
        authTag: Buffer;
    }>;
    aesGCMDecrypt(key: Buffer, encryptedData: Buffer, iv: Buffer, authTag: Buffer): Promise<Buffer>;
    randomBytes(length: number): Buffer;
}
export declare function getCryptoAdapter(): CryptoAdapter;
//# sourceMappingURL=crypto-adapter.d.ts.map