import { BigNumberish, AddressLike, Wallet } from 'ethers';
import { FineTuningServing } from './typechain';
import { ServiceStructOutput, DeliverableStructOutput } from './typechain/FineTuningServing';
export declare class FineTuningServingContract {
    serving: FineTuningServing;
    signer: Wallet;
    private _userAddress;
    private _gasPrice?;
    constructor(signer: Wallet, contractAddress: string, userAddress: string, gasPrice?: number);
    lockTime(): Promise<bigint>;
    listService(): Promise<ServiceStructOutput[]>;
    listAccount(): Promise<import("./typechain/FineTuningServing").AccountStructOutput[]>;
    getAccount(provider: AddressLike): Promise<import("./typechain/FineTuningServing").AccountStructOutput>;
    acknowledgeProviderSigner(providerAddress: AddressLike, providerSigner: AddressLike, gasPrice?: number): Promise<void>;
    acknowledgeDeliverable(providerAddress: AddressLike, index: BigNumberish, gasPrice?: number): Promise<void>;
    getService(providerAddress: string): Promise<ServiceStructOutput>;
    getDeliverable(providerAddress: AddressLike, index: BigNumberish): Promise<DeliverableStructOutput>;
    getUserAddress(): string;
}
//# sourceMappingURL=fine-tuning.d.ts.map