import { Serving__factory } from './serving';
export class ServingContract {
    serving;
    _userAddress;
    constructor(signer, contractAddress, userAddress) {
        this.serving = Serving__factory.connect(contractAddress, signer);
        this._userAddress = userAddress;
    }
    lockTime() {
        return this.serving.lockTime();
    }
    getService(providerAddress, svcName) {
        return this.serving.getService(providerAddress, svcName);
    }
    getUserAddress() {
        return this._userAddress;
    }
}
//# sourceMappingURL=contract.js.map