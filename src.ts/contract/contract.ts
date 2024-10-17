import { JsonRpcSigner } from 'ethers'
import { Serving, Serving__factory } from './serving'
import { ServiceStructOutput } from './serving/Serving'

export class ServingContract {
    public serving: Serving

    private _userAddress: string

    constructor(
        signer: JsonRpcSigner,
        contractAddress: string,
        userAddress: string
    ) {
        this.serving = Serving__factory.connect(contractAddress, signer)
        this._userAddress = userAddress
    }

    lockTime(): Promise<bigint> {
        return this.serving.lockTime()
    }

    getService(
        providerAddress: string,
        svcName: string
    ): Promise<ServiceStructOutput> {
        return this.serving.getService(providerAddress, svcName)
    }

    getUserAddress(): string {
        return this._userAddress
    }
}
