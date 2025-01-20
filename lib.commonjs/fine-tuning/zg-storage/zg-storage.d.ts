export declare class ZGStorage {
    upload(privateKey: string, dataPath: string): Promise<string>;
    download(dataPath: string, dataRoot: string): Promise<void>;
    extractRootFromOutput(output: string): string | null;
}
//# sourceMappingURL=zg-storage.d.ts.map