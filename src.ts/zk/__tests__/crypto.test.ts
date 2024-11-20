import { expect } from 'chai';
import { before } from 'mocha';
import {
    babyJubJubGeneratePrivateKey,
    babyJubJubGeneratePublicKey,
    babyJubJubSignature,
    babyJubJubVerify,
    packSignature,
    packPoint,
    unpackPoint,
    hash,
    unpackSignature,
    PrivateKey,
    PublicKey,
    Message,
    Signature,
} from '../crypto';

describe('Crypto Operations', function () {
    // max timeout 10s
    this.timeout(10000);

    let privateKey: PrivateKey, publicKey: PublicKey, message: Message, signature: Signature;

    before(async () => {
        // generate private keys
        privateKey = await babyJubJubGeneratePrivateKey();
        // generate public key
        publicKey = await babyJubJubGeneratePublicKey(privateKey);
        // generate message
        message = new Uint8Array([1, 2, 3, 4, 5]);
    });

    it('should generate private key', async () => {
        const key = await babyJubJubGeneratePrivateKey();
        expect(key).to.exist;
    });

    it('should generate public key from private key', async () => {
        const pubKey = await babyJubJubGeneratePublicKey(privateKey);
        expect(pubKey).to.exist;
        expect(Array.isArray(pubKey)).to.be.true;
    });

    it('should sign and verify message', async () => {
        signature = await babyJubJubSignature(message, privateKey);
        const isValid = await babyJubJubVerify(message, signature, publicKey);
        expect(isValid).to.be.true;
    });

    it('should pack and unpack signature', async () => {
        const packedSig = await packSignature(signature);
        const unpackedSig = await unpackSignature(packedSig);
        expect(unpackedSig).to.deep.equal(signature);
    });

    it('should pack and unpack point', async () => {
        const packedPoint = await packPoint(publicKey);
        const unpackedPoint = await unpackPoint(packedPoint);
        expect(unpackedPoint).to.deep.equal(publicKey);
    });

    it('should generate hash', async () => {
        const hashed = await hash(message);
        expect(hashed).to.exist;
        expect(hashed instanceof Uint8Array).to.be.true;
    });
});