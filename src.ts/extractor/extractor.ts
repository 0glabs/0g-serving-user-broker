import { FineTuneServiceStruct, InferenceServiceStruct, ServiceStructOutput } from '../contract'

export abstract class Extractor {
    abstract getSvcInfo(): Promise<any>
    abstract getInputCount(content: string): Promise<number>
    abstract getOutputCount(content: string): Promise<number>
}
