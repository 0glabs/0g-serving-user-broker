"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZGServingUserBroker = void 0;
exports.createZGServingUserBroker = createZGServingUserBroker;
const contract_1 = require("../contract");
const request_1 = require("./request");
const response_1 = require("./response");
const verifier_1 = require("./verifier");
class ZGServingUserBroker {
    requestProcessor;
    responseProcessor;
    verifier;
    signer;
    contractAddress;
    config;
    constructor(signer, contractAddress, config) {
        this.signer = signer;
        this.contractAddress = contractAddress;
        this.config = config;
    }
    async initialize() {
        let userAddress;
        try {
            userAddress = await this.signer.getAddress();
        }
        catch (error) {
            throw error;
        }
        const contract = new contract_1.ServingContract(this.signer, this.contractAddress, userAddress);
        this.requestProcessor = new request_1.RequestProcessor(contract, this.config);
        this.responseProcessor = new response_1.ResponseProcessor(contract, this.config);
        this.verifier = new verifier_1.Verifier(contract, this.config);
    }
}
exports.ZGServingUserBroker = ZGServingUserBroker;
/**
 * createZGServingUserBroker 用来初始化 ZGServingUserBroker
 *
 * @param signer - ethers.js 的 Signer。
 * @param contractAddress - 0G Serving 合约地址。
 * @param config - 0G Serving 的配置文件。
 * @returns headers。记录着请求的费用、用户签名等信息。
 */
async function createZGServingUserBroker(signer, contractAddress, config) {
    const broker = new ZGServingUserBroker(signer, contractAddress, config);
    await broker.initialize();
    return broker;
}
//# sourceMappingURL=broker.js.map