import { ServiceStructOutput } from '../contract/serving/Serving';
export declare abstract class Extractor {
    abstract getSvcInfo(): Promise<ServiceStructOutput>;
    abstract getInputCount(content: string): Promise<number>;
    abstract getOutputCount(content: string): Promise<number>;
}
//# sourceMappingURL=extractor.d.ts.map