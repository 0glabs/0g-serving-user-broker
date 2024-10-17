import { ServiceStructOutput } from '../contract/serving/Serving'
import { Extractor } from './extractor'

export class ChatBot extends Extractor {
    svcInfo: ServiceStructOutput

    constructor(svcInfo: ServiceStructOutput) {
        super()
        this.svcInfo = svcInfo
    }

    getSvcInfo(): Promise<ServiceStructOutput> {
        return Promise.resolve(this.svcInfo)
    }

    async getInputCount(content: string): Promise<number> {
        return content.split(/\s+/).length
    }

    async getOutputCount(content: string): Promise<number> {
        return content.split(/\s+/).length
    }
}
