import { FineTuningServingContract } from '../contract';
import { LedgerBroker } from '../../ledger';
import { Provider } from '../provider/provider';
export declare abstract class BrokerBase {
    protected contract: FineTuningServingContract;
    protected ledger: LedgerBroker;
    protected servingProvider: Provider;
    constructor(contract: FineTuningServingContract, ledger: LedgerBroker, servingProvider: Provider);
}
//# sourceMappingURL=base.d.ts.map