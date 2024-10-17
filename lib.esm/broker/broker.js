import { ServingContract } from '../contract';
import { RequestProcessor } from './request';
import { ResponseProcessor } from './response';
import { Verifier } from './verifier';
export class ZGServingUserBroker {
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
        const contract = new ServingContract(this.signer, this.contractAddress, userAddress);
        this.requestProcessor = new RequestProcessor(contract, this.config);
        this.responseProcessor = new ResponseProcessor(contract, this.config);
        this.verifier = new Verifier(contract, this.config);
    }
}
/**
 * createZGServingUserBroker 用来初始化 ZGServingUserBroker
 *
 * @param signer - ethers.js 的 Signer。
 * @param contractAddress - 0G Serving 合约地址。
 * @param config - 0G Serving 的配置文件。
 * @returns headers。记录着请求的费用、用户签名等信息。
 */
export async function createZGServingUserBroker(signer, contractAddress, config) {
    const broker = new ZGServingUserBroker(signer, contractAddress, config);
    await broker.initialize();
    return broker;
}
//# sourceMappingURL=broker.js.map