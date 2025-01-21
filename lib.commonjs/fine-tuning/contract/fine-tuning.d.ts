import { JsonRpcSigner, BigNumberish, AddressLike, Wallet } from 'ethers';
import { FineTuningServing } from './typechain';
import { ServiceStructOutput } from './typechain/FineTuningServing';
export declare class FineTuningServingContract {
    serving: FineTuningServing;
    signer: JsonRpcSigner | Wallet;
    private _userAddress;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string, userAddress: string);
    lockTime(): Promise<bigint>;
    listService(): Promise<ServiceStructOutput[]>;
    listAccount(): Promise<import("./typechain/FineTuningServing").AccountStructOutput[]>;
    getAccount(provider: AddressLike): Promise<import("./typechain/FineTuningServing").AccountStructOutput>;
    acknowledgeProviderSigner(providerAddress: AddressLike, providerSigner: AddressLike): Promise<void>;
    acknowledgeDeliverable(providerAddress: AddressLike, index: BigNumberish): Promise<void>;
    getService(providerAddress: string, svcName: string): Promise<ServiceStructOutput>;
    getDeliverable(providerAddress: string, index: BigNumberish): Promise<import("./typechain/FineTuningServing").DeliverableStructOutput>;
    getUserAddress(): string;
}
//# sourceMappingURL=fine-tuning.d.ts.map