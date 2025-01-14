import { BrokerBase } from './base'

export class ModelProcessor extends BrokerBase {
    // 6. [`use 0g storage sdk`] upload dataset, get dataset root hash
    async uploadDataset(): Promise<string> {
        return ''
    }

    // 9. acknowledge encrypted model with root hash
    //     1. [`call contract`] get deliverable with root hash
    //     2. [`use 0g storage sdk`] download model, calculate root hash, compare with provided root hash
    //     3. [`call contract`] acknowledge the model in contract
    async acknowledgeModel(): Promise<void> {
        return
    }

    // 10. decrypt model
    //     1. [`call contract`] get deliverable with encryptedSecret
    //     2. decrypt the encryptedSecret
    //     3. decrypt model with secret [TODO: Discuss LiuYuan]
    async decryptModel(): Promise<void> {
        return
    }
}
