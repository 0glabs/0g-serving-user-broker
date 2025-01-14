import { FineTuningServingContract } from '../contract'
import { LedgerBroker } from '../../ledger'

export abstract class BrokerBase {
    protected contract: FineTuningServingContract
    protected ledger: LedgerBroker

    constructor(contract: FineTuningServingContract, ledger: LedgerBroker) {
        this.contract = contract
        this.ledger = ledger
    }
}
