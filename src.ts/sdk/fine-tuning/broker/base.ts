import type { FineTuningServingContract } from '../contract'
import type { LedgerBroker } from '../../ledger'
import type { Provider } from '../provider/provider'

export abstract class BrokerBase {
    protected contract: FineTuningServingContract
    protected ledger: LedgerBroker
    protected servingProvider: Provider

    constructor(
        contract: FineTuningServingContract,
        ledger: LedgerBroker,
        servingProvider: Provider
    ) {
        this.contract = contract
        this.ledger = ledger
        this.servingProvider = servingProvider
    }
}
