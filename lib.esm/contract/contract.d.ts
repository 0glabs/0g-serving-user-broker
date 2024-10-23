import { JsonRpcSigner, BigNumberish, AddressLike } from 'ethers';
import { Serving } from './serving';
import { ServiceStructOutput } from './serving/Serving';
export declare class ServingContract {
    serving: Serving;
    private _userAddress;
    constructor(signer: JsonRpcSigner, contractAddress: string, userAddress: string);
    lockTime(): Promise<bigint>;
    listService(): Promise<ServiceStructOutput[]>;
    listAccount(): Promise<import(".").AccountStructOutput[]>;
    getAccount(user: AddressLike, provider: AddressLike): Promise<import(".").AccountStructOutput>;
    addOrUpdateService(name: string, serviceType: string, url: string, model: string, inputPrice: BigNumberish, outputPrice: BigNumberish): Promise<void>;
    addAccount(providerAddress: AddressLike, signer: [BigNumberish, BigNumberish], balance: string): Promise<void>;
    depositFund(providerAddress: AddressLike, balance: string): Promise<void>;
    getService(providerAddress: string, svcName: string): Promise<ServiceStructOutput>;
    getUserAddress(): string;
}
//# sourceMappingURL=contract.d.ts.map