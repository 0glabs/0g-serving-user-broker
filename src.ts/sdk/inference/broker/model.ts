import type { ServiceStructOutput } from '../contract'
import { ZGServingUserBrokerBase } from './base'
import { throwFormattedError } from '../../common/utils'

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
            throwFormattedError(error)
        }
    }
}

export function isVerifiability(value: string): value is Verifiability {
    return Object.values(VerifiabilityEnum).includes(value as VerifiabilityEnum)
}
