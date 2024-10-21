import { ServingContract } from '../contract'
import { JsonRpcSigner } from 'ethers'
import { RequestProcessor } from './request'
import { ResponseProcessor } from './response'
import { Verifier } from './verifier'
import { ZGServingUserBrokerConfig } from './base'
import { AccountProcessor } from './account'

export class ZGServingUserBroker {
    public requestProcessor!: RequestProcessor
    public responseProcessor!: ResponseProcessor
    public verifier!: Verifier
    public accountProcessor!: AccountProcessor

    private signer: JsonRpcSigner
    private contractAddress: string
    private config: ZGServingUserBrokerConfig

    constructor(
        signer: JsonRpcSigner,
        contractAddress: string,
        config: ZGServingUserBrokerConfig
    ) {
        this.signer = signer
        this.contractAddress = contractAddress
        this.config = config
    }

    async initialize() {
        let userAddress: string
        try {
            userAddress = await this.signer.getAddress()
        } catch (error) {
            throw error
        }
        const contract = new ServingContract(
            this.signer,
            this.contractAddress,
            userAddress
        )
        this.requestProcessor = new RequestProcessor(contract, this.config)
        this.responseProcessor = new ResponseProcessor(contract, this.config)
        this.accountProcessor = new AccountProcessor(contract, this.config)
        this.verifier = new Verifier(contract, this.config)
    }
}

/**
 * createZGServingUserBroker 用来初始化 ZGServingUserBroker
 *
 * @param signer - ethers.js 的 Signer。
 * @param contractAddress - 0G Serving 合约地址。
 * @param config - 0G Serving 的配置文件。
 * @returns broker 实例。
 */
export async function createZGServingUserBroker(
    signer: JsonRpcSigner,
    contractAddress: string,
    config: ZGServingUserBrokerConfig
): Promise<ZGServingUserBroker> {
    const broker = new ZGServingUserBroker(signer, contractAddress, config)
    await broker.initialize()
    return broker
}
