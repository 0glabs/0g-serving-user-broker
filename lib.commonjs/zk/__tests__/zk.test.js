"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const zk_1 = require("../zk");
const request_1 = require("../request");
describe('zk dependencies', () => {
    it('should generate a valid key pair', async () => {
        const keyPair = await (0, zk_1.genKeyPair)();
        (0, chai_1.expect)(keyPair).to.have.property('packedPrivkey').with.lengthOf(2);
        (0, chai_1.expect)(keyPair).to.have.property('doublePackedPubkey').with.lengthOf(2);
    });
    it('should sign data correctly', async () => {
        const keyPair = await (0, zk_1.genKeyPair)();
        const data = [
            new request_1.Request(1, '1000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'),
            new request_1.Request(2, '2000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
        ];
        const signatures = await (0, zk_1.signData)(data, keyPair.packedPrivkey);
        (0, chai_1.expect)(signatures).to.be.an('array');
        (0, chai_1.expect)(signatures.length).to.equal(data.length);
    });
    it('should verify signatures correctly', async () => {
        const keyPair = await (0, zk_1.genKeyPair)();
        const data = [
            new request_1.Request(1, '1000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'),
            new request_1.Request(2, '2000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
        ];
        const signatures = await (0, zk_1.signData)(data, keyPair.packedPrivkey);
        const isValid = await (0, zk_1.verifySignature)(data, signatures, keyPair.doublePackedPubkey);
        (0, chai_1.expect)(isValid).to.be.an('array');
        (0, chai_1.expect)(isValid.every(v => v)).to.be.true;
    });
});
//# sourceMappingURL=zk.test.js.map