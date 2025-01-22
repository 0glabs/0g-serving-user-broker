"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
class Provider {
    contract;
    constructor(contract) {
        this.contract = contract;
    }
    async fetchJSON(endpoint, options) {
        try {
            const response = await fetch(endpoint, options);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error);
            }
            return response.json();
        }
        catch (error) {
            throw error;
        }
    }
    async fetchText(endpoint, options) {
        try {
            const response = await fetch(endpoint, options);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const buffer = await response.arrayBuffer();
            return Buffer.from(buffer).toString('utf-8');
        }
        catch (error) {
            throw error;
        }
    }
    async getProviderUrl(providerAddress, serviceName) {
        try {
            const service = await this.contract.getService(providerAddress, serviceName);
            return service.url;
        }
        catch (error) {
            throw error;
        }
    }
    async getQuote(providerAddress, serviceName) {
        try {
            const url = await this.getProviderUrl(providerAddress, serviceName);
            const endpoint = `${url}/v1/quote`;
            const quoteString = await this.fetchText(endpoint, {
                method: 'GET',
            });
            const ret = JSON.parse(quoteString);
            return ret;
        }
        catch (error) {
            throw error;
        }
    }
    async createTask(providerAddress, task) {
        try {
            const url = await this.getProviderUrl(providerAddress, task.serviceName);
            const userAddress = this.contract.getUserAddress();
            const endpoint = `${url}/v1/user/${userAddress}/task`;
            const response = await this.fetchJSON(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(task),
            });
            return response.id;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create task: ${error.message}`);
            }
            throw new Error('Failed to create task');
        }
    }
    async listTask(providerAddress, serviceName, userAddress, latest = false) {
        try {
            const url = await this.getProviderUrl(providerAddress, serviceName);
            let endpoint = `${url}/v1/user/${encodeURIComponent(userAddress)}/task`;
            if (latest) {
                endpoint += '?latest=true';
            }
            return this.fetchJSON(endpoint, { method: 'GET' });
        }
        catch (error) {
            throw error;
        }
    }
    async getLog(providerAddress, serviceName, userAddress, taskID) {
        try {
            const url = await this.getProviderUrl(providerAddress, serviceName);
            const endpoint = `${url}/v1/user/${userAddress}/task/${taskID}/log`;
            return this.fetchText(endpoint, { method: 'GET' });
        }
        catch (error) {
            throw error;
        }
    }
}
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map