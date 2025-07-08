import type { FineTuningServingContract } from '../contract';
import type { LedgerBroker } from '../../ledger';
import type { Provider } from '../provider/provider';
export declare abstract class BrokerBase {
    protected contract: FineTuningServingContract;
    protected ledger: LedgerBroker;
    protected servingProvider: Provider;
    constructor(contract: FineTuningServingContract, ledger: LedgerBroker, servingProvider: Provider);
}
//# sourceMappingURL=base.d.ts.map