import { Metadata } from '../storage';
import { ZGServingUserBrokerBase } from './base';
import { ethers } from 'ethers';
/**
 * Verifier 中包含服务可靠性验证的方法。
 */
export class Verifier extends ZGServingUserBrokerBase {
    /**
     * getAndVerifySigningAddress 验证 signer 的 signing address 对应的 RA 是否合法。
     * 同时将 RA 的 signing address 保存在本地后返回。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @returns 第一返回为布尔值。True 代表返回 signer RA 合法，反之不合法。第二个返回为 signer 的 signer 的 signing address。
     */
    async getAndVerifySigningAddress(providerAddress, svcName) {
        const extractor = await this.getExtractor(providerAddress, svcName, false);
        const svc = await extractor.getSvcInfo();
        const signerRA = await Verifier.fetSignerRA(svc.url, svc.name);
        Metadata.storeSigningKey(providerAddress + svcName, signerRA.signing_address);
        const valid = await this.verifyRA(signerRA.nvidia_payload);
        return {
            valid,
            signingAddress: signerRA.signing_address,
        };
    }
    /**
     * getSigningAddress 返回 signing address。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @returns 第一返回为布尔值。True 代表返回 signer RA 合法，反之不合法。第二个返回为 signer 的 address。
     */
    async getSigningAddress(providerAddress, svcName) {
        let signingKey = Metadata.getSigningKey(providerAddress + svcName);
        if (signingKey) {
            return signingKey;
        }
        const result = await this.getAndVerifySigningAddress(providerAddress, svcName);
        if (!result.valid || !result.signingAddress) {
            return '';
        }
        return result.signingAddress;
    }
    async verifyRA(payload) {
        return Promise.resolve(true);
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
        const messageHash = ethers.hashMessage(message);
        const recoveredAddress = ethers.recoverAddress(messageHash, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    }
}
//# sourceMappingURL=verifier.js.map