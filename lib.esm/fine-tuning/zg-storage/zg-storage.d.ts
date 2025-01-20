export declare class ZGStorage {
    getIndexUrl(isTurbo: boolean): string;
    upload(privateKey: string, dataPath: string, isTurbo: boolean): Promise<string>;
    download(dataPath: string, dataRoot: string, isTurbo: boolean): Promise<void>;
    extractRootFromOutput(output: string): string | null;
}
//# sourceMappingURL=zg-storage.d.ts.map