"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Verifier = void 0;
const storage_1 = require("../storage");
const base_1 = require("./base");
const ethers_1 = require("ethers");
const dcap_qvl_web_1 = require("@phala/dcap-qvl-web");
/**
 * Verifier 中包含服务可靠性验证的方法。
 */
class Verifier extends base_1.ZGServingUserBrokerBase {
    /**
     * getAndVerifySigningAddress 验证 signer 的 signing address 对应的 RA 是否合法。
     *
     * 同时将 RA 的 signing address 保存在 localStorage 并返回。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @returns 第一个返回为布尔值。True 代表返回 signer RA 合法，反之不合法。
     *
     * 第二个返回为 signer 的 signer 的 signing address。
     */
    async getAndVerifySigningAddress(providerAddress, svcName) {
        const extractor = await this.getExtractor(providerAddress, svcName, false);
        const svc = await extractor.getSvcInfo();
        const signerRA = await Verifier.fetSignerRA(svc.url, svc.name);
        const key = this.contract.getUserAddress() + providerAddress + svcName;
        storage_1.Metadata.storeSigningKey(key, signerRA.signing_address);
        const dcapPayload = JSON.parse(signerRA.dcap_payload);
        const valid = await this.verifyRA(dcapPayload);
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
        const key = this.contract.getUserAddress() + providerAddress + svcName;
        let signingKey = storage_1.Metadata.getSigningKey(key);
        if (signingKey) {
            return signingKey;
        }
        const result = await this.getAndVerifySigningAddress(providerAddress, svcName);
        if (!result.valid || !result.signingAddress) {
            return '';
        }
        return result.signingAddress;
    }
    /**
     * getSignerRaDownloadLink 回 Signer RA 的下载链接。
     *
     * 可提供给希望手动验证 Signer RA 的 User。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @returns 下载链接。
     */
    async getSignerRaDownloadLink(providerAddress, svcName) {
        let svc;
        try {
            svc = await this.getService(providerAddress, svcName);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(error?.message);
            }
            throw error;
        }
        return `${svc.url}/v1/proxy/${svcName}/attestation/report`;
    }
    /**
     * getChatSignatureDownloadLink 返回单次对话的签名下载链接。
     *
     * 可提供给希望手动验证单次对话内容的 User。
     *
     * @param providerAddress - provider 地址。
     * @param svcName - service 名称。
     * @param chatID - 对话的 ID。
     * @returns 下载链接。
     */
    async getChatSignatureDownloadLink(providerAddress, svcName, chatID) {
        let svc;
        try {
            svc = await this.getService(providerAddress, svcName);
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(error?.message);
            }
            throw error;
        }
        return `${svc.url}/v1/proxy/${svcName}/signature/${chatID}`;
    }
    async verifyRA(dcapPayload) {
        if (!this.config?.dcapWasmPath) {
            const error = new Error('Missing dcapWasmPath in config');
            console.error(error.message);
            throw error;
        }
        const rawQuote = new Uint8Array(Buffer.from(dcapPayload.quote, 'base64'));
        const quoteCollateral = new Uint8Array(Buffer.from(dcapPayload.collaterals, 'base64'));
        const now = BigInt(Math.floor(Date.now() / 1000));
        const response = await fetch(this.config.dcapWasmPath);
        const wasmArrayBuffer = await response.arrayBuffer();
        await (0, dcap_qvl_web_1.initSync)(wasmArrayBuffer);
        try {
            (0, dcap_qvl_web_1.js_verify)(rawQuote, quoteCollateral, now);
            return true;
        }
        catch (error) {
            if (error instanceof Error) {
                console.error(error.message);
            }
            return false;
        }
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
        const messageHash = ethers_1.ethers.hashMessage(message);
        const recoveredAddress = ethers_1.ethers.recoverAddress(messageHash, signature);
        return recoveredAddress.toLowerCase() === expectedAddress.toLowerCase();
    }
}
exports.Verifier = Verifier;
//# sourceMappingURL=verifier.js.map