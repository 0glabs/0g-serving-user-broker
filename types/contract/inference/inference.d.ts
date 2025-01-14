import { JsonRpcSigner, BigNumberish, AddressLike, Wallet } from 'ethers';
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
    deleteAccount(provider: AddressLike): Promise<void>;
    addOrUpdateService(name: string, serviceType: string, url: string, model: string, verifiability: string, inputPrice: BigNumberish, outputPrice: BigNumberish): Promise<void>;
    addAccount(providerAddress: AddressLike, signer: [BigNumberish, BigNumberish], balance: bigint, settleSignerEncryptedPrivateKey: string): Promise<void>;
    depositFund(providerAddress: AddressLike, balance: string): Promise<void>;
    getService(providerAddress: string, svcName: string): Promise<ServiceStructOutput>;
    getUserAddress(): string;
}
//# sourceMappingURL=inference.d.ts.map