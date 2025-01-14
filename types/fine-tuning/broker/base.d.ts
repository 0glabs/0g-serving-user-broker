import { FineTuningServingContract } from '../contract';
import { LedgerBroker } from '../../ledger';
export declare abstract class BrokerBase {
    protected contract: FineTuningServingContract;
    protected ledger: LedgerBroker;
    constructor(contract: FineTuningServingContract, ledger: LedgerBroker);
}
//# sourceMappingURL=base.d.ts.map