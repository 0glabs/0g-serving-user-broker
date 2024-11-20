"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const request_1 = require("../request");
describe('Request', () => {
    // test data
    const testNonce = 12345;
    const testFee = '1000000';
    const testUserAddress = '0x1234567890123456789012345678901234567890';
    const testProviderAddress = '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd';
    it('should correctly serialize and deserialize a Request', () => {
        // create a new Request instance
        const request = new request_1.Request(testNonce, testFee, testUserAddress, testProviderAddress);
        // serialize
        const serialized = request.serialize();
        // deserialize
        const deserialized = request_1.Request.deserialize(serialized);
        // verify all fields are consistent
        (0, chai_1.expect)(deserialized.getNonce()).to.equal(testNonce);
        (0, chai_1.expect)(deserialized.getFee().toString()).to.equal(testFee);
        (0, chai_1.expect)('0x' + deserialized.getUserAddress().toString(16).padStart(40, '0'))
            .to.equal(testUserAddress.toLowerCase());
        (0, chai_1.expect)('0x' + deserialized.getProviderAddress().toString(16).padStart(40, '0'))
            .to.equal(testProviderAddress.toLowerCase());
    });
    it('should throw error when deserializing invalid length', () => {
        const invalidBytes = new Uint8Array(10); // invalid length
        (0, chai_1.expect)(() => request_1.Request.deserialize(invalidBytes)).to.throw('Invalid byte array length');
    });
});
//# sourceMappingURL=request.test.js.map