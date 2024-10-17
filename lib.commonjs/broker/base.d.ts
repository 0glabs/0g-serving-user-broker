import { ServingContract } from '../contract';
import { Extractor } from '../extractor';
import { ServiceStructOutput } from '../contract/serving/Serving';
export interface ZGServingUserBrokerConfig {
    /**
     * WebAssembly 二进制文件路径。
     *
     * 该文件用于验证 signing address 的 Remote attestation 报告。
     *
     * 0G Serving Broker SDK 的使用者需要将该二进制文件放到服务器的
     * 静态资源目录，并在此填写路径。
     */
    dcapWasmPath: string;
}
export declare abstract class ZGServingUserBrokerBase {
    protected contract: ServingContract;
    protected config: ZGServingUserBrokerConfig;
    constructor(contract: ServingContract, config: ZGServingUserBrokerConfig);
    protected getProviderData(providerAddress: string): Promise<{
        nonce: number | null;
        outputFee: number | null;
        privateKey: bigint[] | null;
    }>;
    protected getService(providerAddress: string, svcName: string, useCache?: boolean): Promise<ServiceStructOutput>;
    protected getExtractor(providerAddress: string, svcName: string, useCache?: boolean): Promise<Extractor>;
    protected createExtractor(svc: ServiceStructOutput): Extractor;
}
//# sourceMappingURL=base.d.ts.map