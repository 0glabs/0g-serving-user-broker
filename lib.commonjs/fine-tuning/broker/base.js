"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerBase = void 0;
class BrokerBase {
    contract;
    ledger;
    zgClient;
    servingProvider;
    constructor(contract, ledger, zgClient, servingProvider) {
        this.contract = contract;
        this.ledger = ledger;
        this.zgClient = zgClient;
        this.servingProvider = servingProvider;
    }
}
exports.BrokerBase = BrokerBase;
//# sourceMappingURL=base.js.map