import { FineTuningServingContract } from '../../contract/fine-tuning'
import { LedgerBroker } from '../../ledger'

export abstract class BrokerBase {
    protected contract: FineTuningServingContract
    protected ledger: LedgerBroker

    constructor(contract: FineTuningServingContract, ledger: LedgerBroker) {
        this.contract = contract
        this.ledger = ledger
    }
}
