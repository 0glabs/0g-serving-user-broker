import { ZGInferenceServingUserBroker, ZGServingUserBrokerBase } from '../base'
import { ethers } from 'ethers'

export interface ResponseSignature {
    text: string
    signature: string
}

export interface SignerRA {
    signing_address: string
    nvidia_payload: string
    intel_quote: string
}

export interface SingerRAVerificationResult {
    /**
     * Whether the signer RA is valid
     * null means the RA has not been verified
     */
    valid: boolean | null
    /**
     * The signing address of the signer
     */
    signingAddress: string
}

/**
 * The Verifier class contains methods for verifying service reliability.
 */
export class Verifier extends ZGInferenceServingUserBroker {
    async verifyService(
        providerAddress: string,
        svcName: string
    ): Promise<boolean | null> {
        try {
            const { valid } = await this.getSigningAddress(
                providerAddress,
                svcName,
                true
            )
            return valid
        } catch (error) {
            throw error
        }
    }

    /**
     * getSigningAddress verifies whether the signing address
     * of the signer corresponds to a valid RA.
     *
     * It also stores the signing address of the RA in
     * localStorage and returns it.
     *
     * @param providerAddress - provider address.
     * @param svcName - service name.
     * @param verifyRA - whether to verify the RA， default is false.
     * @returns The first return value indicates whether the RA is valid,
     * and the second return value indicates the signing address of the RA.
     */
    async getSigningAddress(
        providerAddress: string,
        svcName: string,
        verifyRA = false
    ): Promise<SingerRAVerificationResult> {
        const key = `${this.contract.getUserAddress()}_${providerAddress}_${svcName}`
        let signingKey = await this.metadata.getSigningKey(key)
        if (!verifyRA && signingKey) {
            return {
                valid: null,
                signingAddress: signingKey,
            }
        }

        try {
            const extractor = await this.getExtractor(
                providerAddress,
                svcName,
                false
            )
            const svc = await extractor.getSvcInfo()

            const signerRA = await Verifier.fetSignerRA(svc.url, svc.name)
            if (!signerRA?.signing_address) {
                throw new Error('signing address does not exist')
            }

            signingKey = `${this.contract.getUserAddress()}_${providerAddress}_${svcName}`
            await this.metadata.storeSigningKey(
                signingKey,
                signerRA.signing_address
            )

            // TODO: use intel_quote to verify signing address
            const valid = await Verifier.verifyRA(signerRA.nvidia_payload)

            return {
                valid,
                signingAddress: signerRA.signing_address,
            }
        } catch (error) {
            throw error
        }
    }

    async getSignerRaDownloadLink(
        providerAddress: string,
        svcName: string
    ): Promise<string> {
        try {
            const svc = await this.getService(providerAddress, svcName)
            return `${svc.url}/v1/proxy/${svcName}/attestation/report`
        } catch (error) {
            throw error
        }
    }

    async getChatSignatureDownloadLink(
        providerAddress: string,
        svcName: string,
        chatID: string
    ): Promise<string> {
        try {
            const svc = await this.getService(providerAddress, svcName)
            return `${svc.url}/v1/proxy/${svcName}/signature/${chatID}`
        } catch (error) {
            throw error
        }
    }

    // TODO: add test
    static async verifyRA(nvidia_payload: any): Promise<boolean> {
        return fetch('https://nras.attestation.nvidia.com/v3/attest/gpu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify(nvidia_payload),
        })
            .then((response) => {
                if (response.status === 200) {
                    return true
                }
                if (response.status === 404) {
                    throw new Error('verify RA error: 404')
                } else {
                    return false
                }
            })
            .catch((error) => {
                if (error instanceof Error) {
                    console.error(error.message)
                }
                return false
            })
    }

    static async fetSignerRA(
        providerBrokerURL: string,
        svcName: string
    ): Promise<SignerRA> {
        return fetch(
            `${providerBrokerURL}/v1/proxy/${svcName}/attestation/report`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Network response was not ok')
                }
                return response.json()
            })
            .then((data) => {
                if (data.nvidia_payload) {
                    try {
                        data.nvidia_payload = JSON.parse(data.nvidia_payload)
                    } catch (error) {
                        throw error
                    }
                }
                if (data.intel_quote) {
                    try {
                        const intel_quota = JSON.parse(data.intel_quote)
                        data.intel_quote =
                            '0x' +
                            Buffer.from(intel_quota, 'base64').toString('hex')
                    } catch (error) {
                        throw error
                    }
                }

                return data as SignerRA
            })
            .catch((error) => {
                throw error
            })
    }

    static async fetSignatureByChatID(
        providerBrokerURL: string,
        svcName: string,
        chatID: string
    ): Promise<ResponseSignature> {
        return fetch(
            `${providerBrokerURL}/v1/proxy/${svcName}/signature/${chatID}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error('getting signature error')
                }
                return response.json()
            })
            .then((data) => {
                return data as ResponseSignature
            })
            .catch((error) => {
                throw error
            })
    }

    static verifySignature(
        message: string,
        signature: string,
        expectedAddress: string
    ): boolean {
        const messageHash = ethers.hashMessage(message)

        const recoveredAddress = ethers.recoverAddress(messageHash, signature)

        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase()
    }
}