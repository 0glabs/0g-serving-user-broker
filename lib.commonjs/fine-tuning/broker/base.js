"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BrokerBase = void 0;
class BrokerBase {
    contract;
    ledger;
    constructor(contract, ledger) {
        this.contract = contract;
        this.ledger = ledger;
    }
}
exports.BrokerBase = BrokerBase;
//# sourceMappingURL=base.js.map