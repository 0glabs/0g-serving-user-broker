import { ServiceStructOutput } from '../contract'
import { ZGServingUserBrokerBase } from './base'

export enum VerifiabilityEnum {
    OpML = 'OpML',
    TeeML = 'TeeML',
    ZKML = 'ZKML',
}

export type Verifiability =
    | VerifiabilityEnum.OpML
    | VerifiabilityEnum.TeeML
    | VerifiabilityEnum.ZKML

export class ModelProcessor extends ZGServingUserBrokerBase {
    async listService(): Promise<ServiceStructOutput[]> {
        try {
            const services = await this.contract.listService()
            return services
        } catch (error) {
            throw error
        }
    }
}

export function isVerifiability(value: string): value is Verifiability {
    return Object.values(VerifiabilityEnum).includes(value as VerifiabilityEnum)
}
