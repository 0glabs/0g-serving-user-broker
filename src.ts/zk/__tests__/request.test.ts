import { expect } from 'chai';
import { Request } from '../request';

describe('Request', () => {
    // test data
    const testNonce = 12345;
    const testFee = '1000000';
    const testUserAddress = '0x1234567890123456789012345678901234567890';
    const testProviderAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';

    it('should correctly serialize and deserialize a Request', () => {
        // create a new Request instance
        const request = new Request(
            testNonce,
            testFee,
            testUserAddress,
            testProviderAddress
        );

        // serialize
        const serialized = request.serialize();
        
        // deserialize
        const deserialized = Request.deserialize(serialized);

        // verify all fields are consistent
        expect(deserialized.getNonce()).to.equal(testNonce);
        expect(deserialized.getFee().toString()).to.equal(testFee);
        expect('0x' + deserialized.getUserAddress().toString(16).padStart(40, '0'))
            .to.equal(testUserAddress.toLowerCase());
        expect('0x' + deserialized.getProviderAddress().toString(16).padStart(40, '0'))
            .to.equal(testProviderAddress.toLowerCase());
    });

    it('should throw error when deserializing invalid length', () => {
        const invalidBytes = new Uint8Array(10); // invalid length
        expect(() => Request.deserialize(invalidBytes)).to.throw('Invalid byte array length');
    });
});