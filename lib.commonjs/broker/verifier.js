"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verifier = void 0;
const storage_1 = require("../storage");
const base_1 = require("./base");
const ethers_1 = require("ethers");
/**
 * The Verifier class contains methods for verifying service reliability.
 */
class Verifier extends base_1.ZGServingUserBrokerBase {
    async verifyService(providerAddress, svcName) {
        try {
            const { valid } = await this.getSigningAddress(providerAddress, svcName, true);
            return valid;
        }
        catch (error) {
            throw error;
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
    async getSigningAddress(providerAddress, svcName, verifyRA = false) {
        const key = this.contract.getUserAddress() + providerAddress + svcName;
        let signingKey = storage_1.Metadata.getSigningKey(key);
        if (!verifyRA && signingKey) {
            return {
                valid: null,
                signingAddress: signingKey,
            };
        }
        try {
            const extractor = await this.getExtractor(providerAddress, svcName, false);
            const svc = await extractor.getSvcInfo();
            const signerRA = await Verifier.fetSignerRA(svc.url, svc.name);
            if (!signerRA?.signing_address) {
                throw new Error('signing address does not exist');
            }
            signingKey =
                this.contract.getUserAddress() + providerAddress + svcName;
            storage_1.Metadata.storeSigningKey(signingKey, signerRA.signing_address);
            // TODO: use intel_quote to verify signing address
            const valid = await Verifier.verifyRA(signerRA.nvidia_payload);
            return {
                valid,
                signingAddress: signerRA.signing_address,
            };
        }
        catch (error) {
            throw error;
        }
    }
    async getSignerRaDownloadLink(providerAddress, svcName) {
        try {
            const svc = await this.getService(providerAddress, svcName);
            return `${svc.url}/v1/proxy/${svcName}/attestation/report`;
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(error?.message);
            }
            throw error;
        }
    }
    async getChatSignatureDownloadLink(providerAddress, svcName, chatID) {
        try {
            const svc = await this.getService(providerAddress, svcName);
            return `${svc.url}/v1/proxy/${svcName}/signature/${chatID}`;
        }
        catch (error) {
            throw error;
        }
    }
    // TODO: add test
    static async verifyRA(nvidia_payload) {
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
                return true;
            }
            if (response.status === 404) {
                throw new Error('verify RA error: 404');
            }
            else {
                return false;
            }
        })
            .catch((error) => {
            if (error instanceof Error) {
                console.error(error.message);
            }
            return false;
        });
    }
    static async fetSignerRA(providerBrokerURL, svcName) {
        return fetch(`${providerBrokerURL}/v1/proxy/${svcName}/attestation/report`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then((data) => {
            if (data.nvidia_payload) {
                try {
                    data.nvidia_payload = JSON.parse(data.nvidia_payload);
                }
                catch (error) {
                    throw error;
                }
            }
            if (data.intel_quote) {
                try {
                    const intel_quota = JSON.parse(data.intel_quote);
                    data.intel_quote =
                        '0x' +
                            Buffer.from(intel_quota, 'base64').toString('hex');
                }
                catch (error) {
                    throw error;
                }
            }
            return data;
        })
            .catch((error) => {
            throw error;
        });
    }
    static async fetSignatureByChatID(providerBrokerURL, svcName, chatID) {
        return fetch(`${providerBrokerURL}/v1/proxy/${svcName}/signature/${chatID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then((response) => {
            if (!response.ok) {
                throw new Error('getting signature error');
            }
            return response.json();
        })
            .then((data) => {
            return data;
        })
            .catch((error) => {
            throw error;
        });
    }
    static verifySignature(message, signature, expectedAddress) {
        const messageHash = ethers_1.ethers.hashMessage(message);
        const recoveredAddress = ethers_1.ethers.recoverAddress(messageHash, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    }
}
exports.Verifier = Verifier;
//# sourceMappingURL=verifier.js.map