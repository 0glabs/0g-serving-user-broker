export interface RouterServerOptions {
    providers: string[];
    key?: string;
    rpc?: string;
    ledgerCa?: string;
    inferenceCa?: string;
    gasPrice?: string | number;
    port?: string | number;
    host?: string;
    cacheDuration?: string | number;
}
export declare function runRouterServer(options: RouterServerOptions): Promise<void>;
//# sourceMappingURL=router-server.d.ts.map