import { ZGFineTuneServingUserBroker } from '../base'
import { FineTuneServingContract } from '../../contract'


export class Acknowledge extends ZGFineTuneServingUserBroker {

    constructor(contract: FineTuneServingContract) {
        super(contract)
    }

}