import { expect } from 'chai'
import { describe, it, beforeEach, afterEach } from 'mocha'
import * as sinon from 'sinon'
import { Verifier } from '../verifier'
import { ethers } from 'ethers'

describe('Verifier', () => {
    let sandbox: sinon.SinonSandbox

    beforeEach(() => {
        sandbox = sinon.createSandbox()
    })

    afterEach(() => {
        sandbox.restore()
    })

    describe('verifyRA', () => {
        it('should call NVIDIA attestation API with correct parameters', async () => {
            // Mock fetch
            const fetchStub = sandbox.stub(global, 'fetch')
            const mockResponse = {
                ok: true,
                status: 200,
                json: async () => ({ result: true }),
            }
            fetchStub.resolves(mockResponse as unknown as Response)

            const testPayload = { test: 'payload' }
            const result = await Verifier.verifyRA(testPayload)

            expect(result).to.be.true
            expect(fetchStub.calledOnce).to.be.true
            expect(fetchStub.firstCall.args[0]).to.equal(
                'https://nras.attestation.nvidia.com/v3/attest/gpu'
            )

            const requestInit = fetchStub.firstCall.args[1] as RequestInit
            expect(requestInit.method).to.equal('POST')
            expect(requestInit.headers).to.deep.include({
                'Content-Type': 'application/json',
            })

            const requestBody = JSON.parse(requestInit.body as string)
            expect(requestBody).to.deep.equal(testPayload)
        })

        it('should return false when API returns non-200 status', async () => {
            const fetchStub = sandbox.stub(global, 'fetch')
            const mockResponse = {
                ok: false,
                status: 400,
                json: async () => ({ error: 'Bad request' }),
            }
            fetchStub.resolves(mockResponse as unknown as Response)

            const result = await Verifier.verifyRA({ test: 'payload' })

            expect(result).to.be.false
        })

        it('should return false when fetch throws an error', async () => {
            const fetchStub = sandbox.stub(global, 'fetch')
            fetchStub.rejects(new Error('Network error'))

            const result = await Verifier.verifyRA({ test: 'payload' })

            expect(result).to.be.false
        })
    })

    describe('verifySignature', () => {
        it('should verify valid signatures correctly', () => {
            // Create a real wallet for testing
            const wallet = ethers.Wallet.createRandom()
            const message = 'Test message'
            const signature = wallet.signMessageSync(message)

            const result = Verifier.verifySignature(
                message,
                signature,
                wallet.address
            )

            expect(result).to.be.true
        })

        it('should reject invalid signatures', () => {
            // Create two different wallets
            const wallet1 = ethers.Wallet.createRandom()
            const wallet2 = ethers.Wallet.createRandom()
            const message = 'Test message'
            const signature = wallet1.signMessageSync(message)

            // Verify with wrong address
            const result = Verifier.verifySignature(
                message,
                signature,
                wallet2.address
            )

            expect(result).to.be.false
        })

        it('should reject tampered messages', () => {
            const wallet = ethers.Wallet.createRandom()
            const message = 'Original message'
            const signature = wallet.signMessageSync(message)

            // Verify with different message
            const result = Verifier.verifySignature(
                'Tampered message',
                signature,
                wallet.address
            )

            expect(result).to.be.false
        })
    })

    describe('fetSignerRA', () => {
        it('should fetch signer RA from correct URL', async () => {
            const fetchStub = sandbox.stub(global, 'fetch')
            const mockResponse = {
                ok: true,
                json: async () => ({
                    signing_address: '0x123',
                    nvidia_payload: '{"test":"data"}',
                    intel_quote: 'base64data',
                }),
            }
            fetchStub.resolves(mockResponse as unknown as Response)

            const url = 'https://example.com'
            const model = 'test-model'
            const result = await Verifier.fetSignerRA(url, model)

            expect(fetchStub.calledOnce).to.be.true
            expect(fetchStub.firstCall.args[0]).to.equal(
                `${url}/v1/proxy/attestation/report?model=${model}`
            )
            expect(result.signing_address).to.equal('0x123')
            expect(result.nvidia_payload).to.deep.equal({ test: 'data' })
        })

        it('should handle errors when fetching signer RA', async () => {
            const fetchStub = sandbox.stub(global, 'fetch')
            fetchStub.rejects(new Error('Network error'))

            try {
                await Verifier.fetSignerRA('https://example.com', 'test-model')
                // Should not reach here
                expect.fail('Should have thrown an error')
            } catch (error) {
                expect(error).to.be.instanceOf(Error)
            }
        })
    })

    describe('fetSignatureByChatID', () => {
        it('should fetch signature from correct URL', async () => {
            const fetchStub = sandbox.stub(global, 'fetch')
            const mockResponse = {
                ok: true,
                json: async () => ({
                    text: 'message content',
                    signature: '0xsignature',
                }),
            }
            fetchStub.resolves(mockResponse as unknown as Response)

            const url = 'https://example.com'
            const chatID = 'chat123'
            const model = 'test-model'
            const result = await Verifier.fetSignatureByChatID(
                url,
                chatID,
                model
            )

            expect(fetchStub.calledOnce).to.be.true
            expect(fetchStub.firstCall.args[0]).to.equal(
                `${url}/v1/proxy/signature/${chatID}?model=${model}`
            )
            expect(result.text).to.equal('message content')
            expect(result.signature).to.equal('0xsignature')
        })

        it('should throw error when response is not ok', async () => {
            const fetchStub = sandbox.stub(global, 'fetch')
            const mockResponse = {
                ok: false,
                status: 404,
                json: async () => ({ error: 'Not found' }),
            }
            fetchStub.resolves(mockResponse as unknown as Response)

            try {
                await Verifier.fetSignatureByChatID(
                    'https://example.com',
                    'chat123',
                    'test-model'
                )
                // Should not reach here
                expect.fail('Should have thrown an error')
            } catch (error) {
                expect(error).to.be.instanceOf(Error)
                expect((error as Error).message).to.equal(
                    'getting signature error'
                )
            }
        })
    })
})
