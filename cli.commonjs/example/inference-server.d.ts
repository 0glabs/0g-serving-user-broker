export interface InferenceServerOptions {
    provider: string;
    key?: string;
    rpc?: string;
    ledgerCa?: string;
    inferenceCa?: string;
    gasPrice?: string | number;
    port?: string | number;
    host?: string;
}
export declare function runInferenceServer(options: InferenceServerOptions): Promise<void>;
//# sourceMappingURL=inference-server.d.ts.map