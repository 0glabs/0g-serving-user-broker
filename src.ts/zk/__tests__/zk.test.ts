import { expect } from 'chai';
import { genKeyPair, signData, verifySignature } from '../zk';
import { Request } from '../request';

describe('zk dependencies', () => {
    it('should generate a valid key pair', async () => {
        const keyPair = await genKeyPair();
        expect(keyPair).to.have.property('packedPrivkey').with.lengthOf(2);
        expect(keyPair).to.have.property('doublePackedPubkey').with.lengthOf(2);
    });

    it('should sign data correctly', async () => {
        const keyPair = await genKeyPair();
        const data: Request[] = [
            new Request(1, '1000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'),
            new Request(2, '2000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
        ];
        
        const signatures = await signData(data, keyPair.packedPrivkey);
        expect(signatures).to.be.an('array');
        expect(signatures.length).to.equal(data.length);
    });

    it('should verify signatures correctly', async () => {
        const keyPair = await genKeyPair();
        const data: Request[] = [
            new Request(1, '1000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'),
            new Request(2, '2000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
        ];
        
        const signatures = await signData(data, keyPair.packedPrivkey);
        const isValid = await verifySignature(data, signatures, keyPair.doublePackedPubkey);
        
        expect(isValid).to.be.an('array');
        expect(isValid.every(v => v)).to.be.true;
    });
});