"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseProcessor = void 0;
const base_1 = require("./base");
const model_1 = require("./model");
const verifier_1 = require("./verifier");
/**
 * ResponseProcessor is a subclass of ZGServingUserBroker.
 * It needs to be initialized with createZGServingUserBroker
 * before use.
 */
class ResponseProcessor extends base_1.ZGServingUserBrokerBase {
    verifier;
    constructor(contract, metadata, cache) {
        super(contract, metadata, cache);
        this.contract = contract;
        this.metadata = metadata;
        this.verifier = new verifier_1.Verifier(contract, metadata, cache);
    }
    async settleFeeWithA0gi(providerAddress, serviceName, fee) {
        if (!fee) {
            return;
        }
        await this.settleFee(providerAddress, serviceName, this.a0giToNeuron(fee));
    }
    /**
     * settleFee sends an empty request to the service provider to settle the fee.
     */
    async settleFee(providerAddress, serviceName, fee) {
        try {
            if (!fee) {
                return;
            }
            const service = await this.contract.getService(providerAddress, serviceName);
            if (!service) {
                throw new Error('Service is not available');
            }
            const { provider, name, url } = service;
            const headers = await this.getHeader(provider, name, '', fee);
            const response = await fetch(`${url}/v1/proxy/${name}/settle-fee`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...headers,
                },
            });
            if (response.status !== 202 && response.status !== 200) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }
        }
        catch (error) {
            throw error;
        }
    }
    async processResponse(providerAddress, svcName, content, chatID) {
        try {
            let extractor;
            extractor = await this.getExtractor(providerAddress, svcName);
            const outputFee = await this.calculateOutputFees(extractor, content);
            await this.settleFee(providerAddress, svcName, outputFee);
            const svc = await extractor.getSvcInfo();
            // TODO: Temporarily return true for non-TeeML verifiability.
            // these cases will be handled in the future.
            if ((0, model_1.isVerifiability)(svc.verifiability) ||
                svc.verifiability !== model_1.VerifiabilityEnum.TeeML) {
                return true;
            }
            if (!chatID) {
                throw new Error('Chat ID does not exist');
            }
            let singerRAVerificationResult = await this.verifier.getSigningAddress(providerAddress, svcName);
            if (!singerRAVerificationResult.valid) {
                singerRAVerificationResult =
                    await this.verifier.getSigningAddress(providerAddress, svcName, true);
            }
            if (!singerRAVerificationResult.valid) {
                throw new Error('Signing address is invalid');
            }
            const ResponseSignature = await verifier_1.Verifier.fetSignatureByChatID(svc.url, svcName, chatID);
            return verifier_1.Verifier.verifySignature(ResponseSignature.text, `0x${ResponseSignature.signature}`, singerRAVerificationResult.signingAddress);
        }
        catch (error) {
            throw error;
        }
    }
    async calculateOutputFees(extractor, content) {
        const svc = await extractor.getSvcInfo();
        const outputCount = await extractor.getOutputCount(content);
        return BigInt(outputCount) * svc.outputPrice;
    }
}
exports.ResponseProcessor = ResponseProcessor;
//# sourceMappingURL=response.js.map