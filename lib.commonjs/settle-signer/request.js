"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Request = void 0;
const utils_1 = require("./utils");
const ADDR_LENGTH = 20;
const NONCE_LENGTH = 4;
const FEE_LENGTH = 8;
class Request {
    nonce;
    fee;
    userAddress;
    providerAddress;
    constructor(nonce, fee, userAddress, // hexstring format with '0x' prefix
    providerAddress // hexstring format with '0x' prefix
    ) {
        this.nonce = parseInt(nonce.toString());
        this.fee = BigInt(parseInt(fee.toString()));
        this.userAddress = BigInt(userAddress);
        this.providerAddress = BigInt(providerAddress);
    }
    serialize() {
        const buffer = new ArrayBuffer(NONCE_LENGTH + ADDR_LENGTH * 2 + FEE_LENGTH);
        const view = new DataView(buffer);
        let offset = 0;
        // write nonce (u32)
        view.setUint32(offset, this.nonce, true);
        offset += NONCE_LENGTH;
        // write fee (u64)
        const feeBytes = (0, utils_1.bigintToBytes)(this.fee, FEE_LENGTH);
        new Uint8Array(buffer, offset, FEE_LENGTH).set(feeBytes);
        offset += FEE_LENGTH;
        // write userAddress (u160)
        const userAddressBytes = (0, utils_1.bigintToBytes)(this.userAddress, ADDR_LENGTH);
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(userAddressBytes);
        offset += ADDR_LENGTH;
        // write providerAddress (u160)
        const providerAddressBytes = (0, utils_1.bigintToBytes)(this.providerAddress, ADDR_LENGTH);
        new Uint8Array(buffer, offset, ADDR_LENGTH).set(providerAddressBytes);
        offset += ADDR_LENGTH;
        return new Uint8Array(buffer);
    }
    static deserialize(byteArray) {
        const expectedLength = NONCE_LENGTH + ADDR_LENGTH * 2 + FEE_LENGTH;
        if (byteArray.length !== expectedLength) {
            throw new Error(`Invalid byte array length for deserialization. Expected: ${expectedLength}, but got: ${byteArray.length}`);
        }
        const view = new DataView(byteArray.buffer);
        let offset = 0;
        // read nonce (u32)
        const nonce = view.getUint32(offset, true);
        offset += NONCE_LENGTH;
        // read fee (u64)
        const fee = (0, utils_1.bytesToBigint)(new Uint8Array(byteArray.slice(offset, offset + FEE_LENGTH)));
        offset += FEE_LENGTH;
        // read userAddress (u160)
        const userAddress = (0, utils_1.bytesToBigint)(new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH)));
        offset += ADDR_LENGTH;
        // read providerAddress (u160)
        const providerAddress = (0, utils_1.bytesToBigint)(new Uint8Array(byteArray.slice(offset, offset + ADDR_LENGTH)));
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
exports.Request = Request;
//# sourceMappingURL=request.js.map