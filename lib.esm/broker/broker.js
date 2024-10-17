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
    constructor(signer, contractAddress) {
        this.signer = signer;
        this.contractAddress = contractAddress;
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
        this.requestProcessor = new RequestProcessor(contract);
        this.responseProcessor = new ResponseProcessor(contract);
        this.verifier = new Verifier(contract);
    }
}
/**
 * createZGServingUserBroker 用来初始化 ZGServingUserBroker
 *
 * @param signer - ethers.js 的 Signer。
 * @param contractAddress - 0G Serving 合约地址。
 * @returns headers。记录着请求的费用、用户签名等信息。
 */
export async function createZGServingUserBroker(signer, contractAddress) {
    const broker = new ZGServingUserBroker(signer, contractAddress);
    await broker.initialize();
    return broker;
}
//# sourceMappingURL=broker.js.map