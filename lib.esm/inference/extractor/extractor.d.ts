import { ServiceStructOutput } from '../contract';
export declare abstract class Extractor {
    abstract getSvcInfo(): Promise<ServiceStructOutput>;
    abstract getInputCount(content: string): Promise<number>;
    abstract getOutputCount(content: string): Promise<number>;
}
//# sourceMappingURL=extractor.d.ts.map