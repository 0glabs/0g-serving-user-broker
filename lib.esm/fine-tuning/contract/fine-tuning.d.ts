import { JsonRpcSigner, BigNumberish, AddressLike, Wallet } from 'ethers';
import { FineTuningServing } from './typechain';
import { ServiceStructOutput, DeliverableStructOutput } from './typechain/FineTuningServing';
export declare class FineTuningServingContract {
    serving: FineTuningServing;
    signer: JsonRpcSigner | Wallet;
    private _userAddress;
    constructor(signer: JsonRpcSigner | Wallet, contractAddress: string, userAddress: string);
    lockTime(): Promise<bigint>;
    listService(): Promise<ServiceStructOutput[]>;
    listAccount(): Promise<import(".").AccountStructOutput[]>;
    getAccount(provider: AddressLike): Promise<import(".").AccountStructOutput>;
    acknowledgeProviderSigner(providerAddress: AddressLike, providerSigner: AddressLike): Promise<void>;
    acknowledgeDeliverable(providerAddress: AddressLike, index: BigNumberish): Promise<void>;
    getService(providerAddress: string, svcName: string): Promise<ServiceStructOutput>;
    getDeliverable(providerAddress: AddressLike, index: BigNumberish): Promise<DeliverableStructOutput>;
    getUserAddress(): string;
}
//# sourceMappingURL=fine-tuning.d.ts.map