import { ServiceStructOutput } from '../contract';
import { ZGServingUserBrokerBase } from './base';
export declare enum VerifiabilityEnum {
    OpML = "OpML",
    TeeML = "TeeML",
    ZKML = "ZKML"
}
export type Verifiability = VerifiabilityEnum.OpML | VerifiabilityEnum.TeeML | VerifiabilityEnum.ZKML;
export interface ZGService {
    Device?: string;
    Geolocation?: string;
    InputPrice: number;
    AttestationDownLoadEndpoint: string;
    Model: string;
    Name: string;
    OutputPrice: number;
    ProviderAddress: string;
    ServiceType: string;
    UpdatedAt: string;
    Uptime?: string;
    URL: string;
    Verifiability?: Verifiability;
}
export interface ZGServingModel {
    Name: string;
    Type: string;
    Author?: string;
    Description?: string;
    HuggingFaceURL?: string;
    ZGAlignmentScore?: string;
    UserInteractedNumber?: number;
    Price: string;
    Verifiability: Verifiability;
    Providers: ZGService[];
}
/**
 * serviceProcessor 包含对 0G Serving Contract 上的 Service/Models 的 list 操作，
 */
export declare class ModelProcessor extends ZGServingUserBrokerBase {
    listService(): Promise<ServiceStructOutput[]>;
    /**
     * listModels 列出 models
     *
     * @returns models
     */
    listModels(): Promise<ZGServingModel[]>;
    /**
     * getModel 得到 model 的详细信息，以及下属 provider 列表
     *
     * @param name - model 名称。
     * @returns headers。记录着请求的费用、用户签名等信息。
     */
    getModel(name: string): Promise<ZGServingModel>;
    static groupByModel(items: ServiceStructOutput[]): ZGServingModel[];
    static parseService(service: ServiceStructOutput): ZGService;
    static getModelVerifiability(services: ZGService[]): Verifiability;
}
//# sourceMappingURL=model.d.ts.map