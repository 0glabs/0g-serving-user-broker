"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const request_1 = require("../request");
const helper_1 = require("../helper");
const crypto_1 = require("../crypto");
describe('ZK Helper Functions', () => {
    it('should correctly sign and verify multiple requests', async () => {
        // generate private key (32 bytes)
        const privateKey = await (0, crypto_1.babyJubJubGeneratePrivateKey)();
        // generate corresponding public key
        const publicKey = await (0, crypto_1.babyJubJubGeneratePublicKey)(privateKey);
        // create test requests
        const requests = [
            new request_1.Request(1, '1000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd'),
            new request_1.Request(2, '2000', '0x1234567890123456789012345678901234567890', '0xabcdefabcdefabcdefabcdefabcdefabcdefabcd')
        ];
        // sign and verify requests
        const result = await (0, helper_1.signAndVerifyRequests)(requests, privateKey, publicKey);
        // verify result contains expected properties
        (0, chai_1.expect)(result).to.have.property('packPubkey');
        (0, chai_1.expect)(result).to.have.property('r8');
        (0, chai_1.expect)(result).to.have.property('s');
        // verify signature count matches request count
        (0, chai_1.expect)(result.r8.length).to.equal(requests.length);
        (0, chai_1.expect)(result.s.length).to.equal(requests.length);
        // verify signature part length
        (0, chai_1.expect)(result.r8[0].length).to.equal(helper_1.FIELD_SIZE); // FIELD_SIZE
        (0, chai_1.expect)(result.s[0].length).to.equal(helper_1.FIELD_SIZE); // FIELD_SIZE
    });
});
//# sourceMappingURL=helper.test.js.map