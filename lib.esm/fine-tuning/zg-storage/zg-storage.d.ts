export interface UploadArgs {
    url: string;
    privateKey: string;
    indexerUrl: string;
    dataPath: string;
}
export interface DownloadArgs {
    dataPath: string;
    indexerUrl: string;
    dataRoot: string;
}
export declare class ZGStorage {
    upload(uploadArgs: UploadArgs): Promise<string>;
    download(downloadArgs: DownloadArgs): Promise<void>;
    extractRootFromOutput(output: string): string | null;
}
//# sourceMappingURL=zg-storage.d.ts.map