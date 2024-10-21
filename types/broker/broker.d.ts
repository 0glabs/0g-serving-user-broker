import { JsonRpcSigner } from 'ethers';
import { RequestProcessor } from './request';
import { ResponseProcessor } from './response';
import { Verifier } from './verifier';
import { ZGServingUserBrokerConfig } from './base';
import { AccountProcessor } from './account';
export declare class ZGServingUserBroker {
    requestProcessor: RequestProcessor;
    responseProcessor: ResponseProcessor;
    verifier: Verifier;
    accountProcessor: AccountProcessor;
    private signer;
    private contractAddress;
    private config;
    constructor(signer: JsonRpcSigner, contractAddress: string, config: ZGServingUserBrokerConfig);
    initialize(): Promise<void>;
}
/**
 * createZGServingUserBroker 用来初始化 ZGServingUserBroker
 *
 * @param signer - ethers.js 的 Signer。
 * @param contractAddress - 0G Serving 合约地址。
 * @param config - 0G Serving 的配置文件。
 * @returns broker 实例。
 */
export declare function createZGServingUserBroker(signer: JsonRpcSigner, contractAddress: string, config: ZGServingUserBrokerConfig): Promise<ZGServingUserBroker>;
//# sourceMappingURL=broker.d.ts.map