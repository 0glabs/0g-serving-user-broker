import { ZGServingUserBrokerBase } from './base'
import { genKeyPair } from '../settle-signer'
import { AddressLike, BigNumberish } from 'ethers'
import { encryptData, privateKeyToStr } from '../utils'
import { FineTuneServingContract, InferenceServingContract, LedgerContract, LedgerStructOutput } from '../contract'
import { Cache, Metadata } from '../storage'
import { AccountProcessor } from '../broker'

export class LedgerProcessor extends ZGServingUserBrokerBase {
    protected finetuneAccount : AccountProcessor
    protected inferenceAccount : AccountProcessor

    constructor(contract: LedgerContract,
                inf_contract : InferenceServingContract,
                ft_contract : FineTuneServingContract,
                metadata: Metadata, cache: Cache) {
        super(contract, metadata, cache)
        this.finetuneAccount = new AccountProcessor(ft_contract, metadata, cache)
        this.inferenceAccount = new AccountProcessor(inf_contract, metadata, cache)
    }

    async getLedger() : Promise<LedgerStructOutput> {
        try {
            return await this.getLedger()
        } catch (error) {
            throw error
        }
    }

    async addLedger(balance : number) {
        try {
            try {
                const l = await this.getLedger()
                if (l) {
                    throw new Error(
                        'Account already exists, with balance: ' +
                        this.neuronToA0gi(l.totalBalance) +
                        ' A0GI'
                    )
                }
            } catch (error) {
                // todo: not sure
                if (!(error as any).message.includes('LedgerNotexists')) {
                    throw error
                }
            }

            // todo: not sure this providerAddr
            const { settleSignerPublicKey, settleSignerEncryptedPrivateKey } =
                await this.createSettleSignerKey("provider_addr")

            await this.contract.addLedger(
                settleSignerPublicKey,
                this.a0giToNeuron(balance),
                settleSignerEncryptedPrivateKey
            )
        } catch (error) {
            throw error
        }
    }

    async depositFund(amount : number) {
       try {
          this.contract.depositFund(amount)
       } catch (error) {
           throw error
       }
    }

    async _transferFund(provider : string,
                        amount : BigNumberish,
                        acc,
                        service) {
        try {
            const has_account = await acc.getAccount(provider)
            if (!has_account) {
                await acc.addAccount(provider, 0)
            }

            try {
                // transfer balance from ledger to account
                await this.contract.transferFund(provider, service, amount)
            } catch (error) {
                throw error
            }
        } catch (error) {
            throw error
        }
    }

    async _retriveFund(provider : string, service) {
        try {
            this.contract.retriveFund(provider, service)
        } catch (error) {
            throw error
        }
    }

    async transferFundToInf(provider : string, amount : BigNumberish) {
        try {
            await this._transferFund(provider, amount, this.inferenceAccount, "inference")
        } catch (error) {
            throw error
        }
    }

    async transferFundToFT(provider : string, amount : BigNumberish) {
        try {
            await this._transferFund(provider, amount, this.finetuneAccount, "fine-tune")
        } catch (error) {
            throw error
        }
    }

    async retrieveFundFromInf(provider : string) {
        try {
            await this._retriveFund(provider, "inference")
        } catch (error) {
            throw error
        }
    }

    async retrieveFundFromFT(provider : string) {
        try {
            await this._retriveFund(provider, "fine-tune")
        } catch (error) {
            throw error
        }
    }
}