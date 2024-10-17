"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServingContract = void 0;
const serving_1 = require("./serving");
class ServingContract {
    serving;
    _userAddress;
    constructor(signer, contractAddress, userAddress) {
        this.serving = serving_1.Serving__factory.connect(contractAddress, signer);
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
exports.ServingContract = ServingContract;
//# sourceMappingURL=contract.js.map