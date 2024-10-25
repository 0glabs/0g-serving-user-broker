import { ServiceStructOutput } from '../contract';
import { ZGServingUserBrokerBase } from './base';
export declare enum VerifiabilityEnum {
    Basic = "Basic",
    Secure = "Secure",
    UltraSecure = "Ultra-Secure"
}
export type Verifiability = VerifiabilityEnum.Basic | VerifiabilityEnum.Secure | VerifiabilityEnum.UltraSecure;
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
    listModels(): Promise<ZGServingModel[]>;
    getModel(name: string): Promise<ZGServingModel>;
    static groupByModel(items: ServiceStructOutput[]): ZGServingModel[];
    static parseService(service: ServiceStructOutput): ZGService;
    static getModelVerifiability(services: ZGService[]): Verifiability;
}
//# sourceMappingURL=model.d.ts.map