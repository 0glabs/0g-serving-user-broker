"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerBase = void 0;
class BrokerBase {
    contract;
    ledger;
    servingProvider;
    constructor(contract, ledger, servingProvider) {
        this.contract = contract;
        this.ledger = ledger;
        this.servingProvider = servingProvider;
    }
}
exports.BrokerBase = BrokerBase;
//# sourceMappingURL=base.js.map