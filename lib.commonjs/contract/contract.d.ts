import { JsonRpcSigner } from 'ethers';
import { Serving } from './serving';
import { ServiceStructOutput } from './serving/Serving';
export declare class ServingContract {
    serving: Serving;
    private _userAddress;
    constructor(signer: JsonRpcSigner, contractAddress: string, userAddress: string);
    lockTime(): Promise<bigint>;
    getService(providerAddress: string, svcName: string): Promise<ServiceStructOutput>;
    getUserAddress(): string;
}
//# sourceMappingURL=contract.d.ts.map