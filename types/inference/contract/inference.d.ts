import { JsonRpcSigner, AddressLike, Wallet } from 'ethers';
import { InferenceServing } from './typechain';
import { ServiceStructOutput } from './typechain/InferenceServing';
export declare class InferenceServingContract {
    serving: InferenceServing;
    signer: JsonRpcSigner | Wallet;
    private _userAddress;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string, userAddress: string);
    lockTime(): Promise<bigint>;
    listService(): Promise<ServiceStructOutput[]>;
    listAccount(): Promise<import("./typechain/InferenceServing").AccountStructOutput[]>;
    getAccount(provider: AddressLike): Promise<import("./typechain/InferenceServing").AccountStructOutput>;
    getService(providerAddress: string, svcName: string): Promise<ServiceStructOutput>;
    getUserAddress(): string;
}
//# sourceMappingURL=inference.d.ts.map