"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const mocha_1 = require("mocha");
const sinon = tslib_1.__importStar(require("sinon"));
const verifier_1 = require("../verifier");
const ethers_1 = require("ethers");
(0, mocha_1.describe)('Verifier', () => {
    let sandbox;
    (0, mocha_1.beforeEach)(() => {
        sandbox = sinon.createSandbox();
    });
    (0, mocha_1.afterEach)(() => {
        sandbox.restore();
    });
    (0, mocha_1.describe)('verifyRA', () => {
        (0, mocha_1.it)('should call NVIDIA attestation API with correct parameters', async () => {
            // Mock fetch
            const fetchStub = sandbox.stub(global, 'fetch');
            const mockResponse = {
                ok: true,
                status: 200,
                json: async () => ({ result: true }),
            };
            fetchStub.resolves(mockResponse);
            const testPayload = { test: 'payload' };
            const result = await verifier_1.Verifier.verifyRA(testPayload);
            (0, chai_1.expect)(result).to.be.true;
            (0, chai_1.expect)(fetchStub.calledOnce).to.be.true;
            (0, chai_1.expect)(fetchStub.firstCall.args[0]).to.equal('https://nras.attestation.nvidia.com/v3/attest/gpu');
            const requestInit = fetchStub.firstCall.args[1];
            (0, chai_1.expect)(requestInit.method).to.equal('POST');
            (0, chai_1.expect)(requestInit.headers).to.deep.include({
                'Content-Type': 'application/json',
            });
            const requestBody = JSON.parse(requestInit.body);
            (0, chai_1.expect)(requestBody).to.deep.equal(testPayload);
        });
        (0, mocha_1.it)('should return false when API returns non-200 status', async () => {
            const fetchStub = sandbox.stub(global, 'fetch');
            const mockResponse = {
                ok: false,
                status: 400,
                json: async () => ({ error: 'Bad request' }),
            };
            fetchStub.resolves(mockResponse);
            const result = await verifier_1.Verifier.verifyRA({ test: 'payload' });
            (0, chai_1.expect)(result).to.be.false;
        });
        (0, mocha_1.it)('should return false when fetch throws an error', async () => {
            const fetchStub = sandbox.stub(global, 'fetch');
            fetchStub.rejects(new Error('Network error'));
            const result = await verifier_1.Verifier.verifyRA({ test: 'payload' });
            (0, chai_1.expect)(result).to.be.false;
        });
    });
    (0, mocha_1.describe)('verifySignature', () => {
        (0, mocha_1.it)('should verify valid signatures correctly', () => {
            // Create a real wallet for testing
            const wallet = ethers_1.ethers.Wallet.createRandom();
            const message = 'Test message';
            const signature = wallet.signMessageSync(message);
            const result = verifier_1.Verifier.verifySignature(message, signature, wallet.address);
            (0, chai_1.expect)(result).to.be.true;
        });
        (0, mocha_1.it)('should reject invalid signatures', () => {
            // Create two different wallets
            const wallet1 = ethers_1.ethers.Wallet.createRandom();
            const wallet2 = ethers_1.ethers.Wallet.createRandom();
            const message = 'Test message';
            const signature = wallet1.signMessageSync(message);
            // Verify with wrong address
            const result = verifier_1.Verifier.verifySignature(message, signature, wallet2.address);
            (0, chai_1.expect)(result).to.be.false;
        });
        (0, mocha_1.it)('should reject tampered messages', () => {
            const wallet = ethers_1.ethers.Wallet.createRandom();
            const message = 'Original message';
            const signature = wallet.signMessageSync(message);
            // Verify with different message
            const result = verifier_1.Verifier.verifySignature('Tampered message', signature, wallet.address);
            (0, chai_1.expect)(result).to.be.false;
        });
    });
    (0, mocha_1.describe)('fetSignerRA', () => {
        (0, mocha_1.it)('should fetch signer RA from correct URL', async () => {
            const fetchStub = sandbox.stub(global, 'fetch');
            const mockResponse = {
                ok: true,
                json: async () => ({
                    signing_address: '0x123',
                    nvidia_payload: '{"test":"data"}',
                    intel_quote: 'base64data',
                }),
            };
            fetchStub.resolves(mockResponse);
            const url = 'https://example.com';
            const model = 'test-model';
            const result = await verifier_1.Verifier.fetSignerRA(url, model);
            (0, chai_1.expect)(fetchStub.calledOnce).to.be.true;
            (0, chai_1.expect)(fetchStub.firstCall.args[0]).to.equal(`${url}/v1/proxy/attestation/report?model=${model}`);
            (0, chai_1.expect)(result.signing_address).to.equal('0x123');
            (0, chai_1.expect)(result.nvidia_payload).to.deep.equal({ test: 'data' });
        });
        (0, mocha_1.it)('should handle errors when fetching signer RA', async () => {
            const fetchStub = sandbox.stub(global, 'fetch');
            fetchStub.rejects(new Error('Network error'));
            try {
                await verifier_1.Verifier.fetSignerRA('https://example.com', 'test-model');
                // Should not reach here
                chai_1.expect.fail('Should have thrown an error');
            }
            catch (error) {
                (0, chai_1.expect)(error).to.be.instanceOf(Error);
            }
        });
    });
    (0, mocha_1.describe)('fetSignatureByChatID', () => {
        (0, mocha_1.it)('should fetch signature from correct URL', async () => {
            const fetchStub = sandbox.stub(global, 'fetch');
            const mockResponse = {
                ok: true,
                json: async () => ({
                    text: 'message content',
                    signature: '0xsignature',
                }),
            };
            fetchStub.resolves(mockResponse);
            const url = 'https://example.com';
            const chatID = 'chat123';
            const model = 'test-model';
            const result = await verifier_1.Verifier.fetSignatureByChatID(url, chatID, model, true);
            (0, chai_1.expect)(fetchStub.calledOnce).to.be.true;
            (0, chai_1.expect)(fetchStub.firstCall.args[0]).to.equal(`${url}/v1/proxy/signature/${chatID}?model=${model}`);
            (0, chai_1.expect)(result.text).to.equal('message content');
            (0, chai_1.expect)(result.signature).to.equal('0xsignature');
        });
        (0, mocha_1.it)('should throw error when response is not ok', async () => {
            const fetchStub = sandbox.stub(global, 'fetch');
            const mockResponse = {
                ok: false,
                status: 404,
                json: async () => ({ error: 'Not found' }),
            };
            fetchStub.resolves(mockResponse);
            try {
                await verifier_1.Verifier.fetSignatureByChatID('https://example.com', 'chat123', 'test-model', true);
                // Should not reach here
                chai_1.expect.fail('Should have thrown an error');
            }
            catch (error) {
                (0, chai_1.expect)(error).to.be.instanceOf(Error);
                (0, chai_1.expect)(error.message).to.equal('getting signature error');
            }
        });
    });
});
//# sourceMappingURL=verifier.test.js.map