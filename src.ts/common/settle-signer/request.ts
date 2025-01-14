import { bigintToBytes, bytesToBigint } from './utils'

const ADDR_LENGTH = 20
const NONCE_LENGTH = 8
const FEE_LENGTH = 16

export class Request {
    private nonce: bigint
    private fee: bigint
    private userAddress: bigint
    private providerAddress: bigint

    constructor(
        nonce: string,
        fee: string,
        userAddress: string, // hexstring format with '0x' prefix
        providerAddress: string // hexstring format with '0x' prefix
    ) {
        this.nonce = BigInt(nonce)
        this.fee = BigInt(fee)

        this.userAddress = BigInt(userAddress)
        this.providerAddress = BigInt(providerAddress)
    }

    public serialize(): Uint8Array {
        const buffer = new ArrayBuffer(
            NONCE_LENGTH + ADDR_LENGTH * 2 + FEE_LENGTH
        )
        let offset = 0

        // write nonce (u64)
        const nonceBytes = bigintToBytes(this.nonce, NONCE_LENGTH)
        new Uint8Array(buffer, offset, NONCE_LENGTH).set(nonceBytes)
        offset += NONCE_LENGTH

        // write fee (u128)
        const feeBytes = bigintToBytes(this.fee, FEE_LENGTH)
        new Uint8Array(buffer, offset, FEE_LENGTH).set(feeBytes)
        offset += FEE_LENGTH

        // write userAddress (u160)
        const userAddressBytes = bigintToBytes(this.userAddress, ADDR_LENGTH)
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(userAddressBytes)
        offset += ADDR_LENGTH

        // write providerAddress (u160)
        const providerAddressBytes = bigintToBytes(
            this.providerAddress,
            ADDR_LENGTH
        )
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(providerAddressBytes)
        offset += ADDR_LENGTH

        return new Uint8Array(buffer)
    }

    public static deserialize(byteArray: Uint8Array): Request {
        const expectedLength = NONCE_LENGTH + ADDR_LENGTH * 2 + FEE_LENGTH
        if (byteArray.length !== expectedLength) {
            throw new Error(
                `Invalid byte array length for deserialization. Expected: ${expectedLength}, but got: ${byteArray.length}`
            )
        }

        let offset = 0

        // read nonce (u64)
        const nonce = bytesToBigint(
            new Uint8Array(byteArray.slice(offset, offset + NONCE_LENGTH))
        )
        offset += NONCE_LENGTH

        // read fee (u128)
        const fee = bytesToBigint(
            new Uint8Array(byteArray.slice(offset, offset + FEE_LENGTH))
        )
        offset += FEE_LENGTH

        // read userAddress (u160)
        const userAddress = bytesToBigint(
            new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH))
        )
        offset += ADDR_LENGTH

        // read providerAddress (u160)
        const providerAddress = bytesToBigint(
            new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH))
        )
        offset += ADDR_LENGTH

        return new Request(
            nonce.toString(),
            fee.toString(),
            '0x' + userAddress.toString(16),
            '0x' + providerAddress.toString(16)
        )
    }

    // Getters
    public getNonce(): bigint {
        return this.nonce
    }

    public getFee(): bigint {
        return this.fee
    }

    public getUserAddress(): bigint {
        return this.userAddress
    }

    public getProviderAddress(): bigint {
        return this.providerAddress
    }
}
