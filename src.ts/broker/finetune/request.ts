import { ZGFineTuneServingUserBroker } from '../base'
import { FineTuneServingContract } from '../../contract'

export class FTRequestProcessor extends ZGFineTuneServingUserBroker {

    constructor(contract: FineTuneServingContract) {
        super(contract)
    }

    async createTask() {

    }
}
