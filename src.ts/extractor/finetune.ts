import { FineTuneServiceStruct, FineTuneServingContract } from '../contract'
import { Extractor } from './extractor'

export class ModelFineTune extends Extractor {
    svcInfo: FineTuneServiceStruct

    constructor(svcInfo: FineTuneServiceStruct) {
        super()
        this.svcInfo = svcInfo
    }

    getSvcInfo(): Promise<FineTuneServiceStruct> {
        return Promise.resolve(this.svcInfo)
    }

    async getInputCount(content: string): Promise<number> {
        // todo: get from dataset?
        if (!content) {
            return 0
        }
        return content.split(/\s+/).length
    }

    async getOutputCount(content: string): Promise<number> {
        // todo: get from dataset?
        if (!content) {
            return 0
        }
        return content.split(/\s+/).length
    }
}
