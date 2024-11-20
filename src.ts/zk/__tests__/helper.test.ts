import { expect } from 'chai';
import { Request } from '../request';
import { signAndVerifyRequests, FIELD_SIZE } from '../helper';
import { babyJubJubGeneratePrivateKey, babyJubJubGeneratePublicKey } from '../crypto';
describe('ZK Helper Functions', () => {
    it('should correctly sign and verify multiple requests', async () => {
        // generate private key (32 bytes)
        const privateKey = await babyJubJubGeneratePrivateKey();
        
        // generate corresponding public key
        const publicKey = await babyJubJubGeneratePublicKey(privateKey);

        // create test requests
        const requests = [
            new Request(1, '1000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'),
            new Request(2, '2000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
        ];

        // sign and verify requests
        const result = await signAndVerifyRequests(
            requests,
            privateKey,
            publicKey
        );

        // verify result contains expected properties
        expect(result).to.have.property('packPubkey');
        expect(result).to.have.property('r8');
        expect(result).to.have.property('s');
        
        // verify signature count matches request count
        expect(result.r8.length).to.equal(requests.length);
        expect(result.s.length).to.equal(requests.length);

        // verify signature part length
        expect(result.r8[0].length).to.equal(FIELD_SIZE); // FIELD_SIZE
        expect(result.s[0].length).to.equal(FIELD_SIZE); // FIELD_SIZE
    });
});