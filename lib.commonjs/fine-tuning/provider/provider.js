"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
class Provider {
    contract;
    constructor(contract) {
        this.contract = contract;
    }
    async createTask(modelHash, rootHash, isTurbo, providerAddress, serviceName, fee, trainingParams) {
        // Fetch the provider URL
        const url = await this.getProviderUrl(providerAddress, serviceName);
        // Construct the API endpoint
        const endpoint = `${url}/v1/task`;
        // Prepare the request payload
        const payload = {
            customerAddress: providerAddress,
            preTrainedModelHash: modelHash,
            datasetHash: rootHash,
            trainingParams,
            isTurbo,
            fee,
            nonce: "nonce-value",
            signature: "signature-value",
        };
        // Make the POST request
        const response = await axios_1.default.post(endpoint, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        if (response.status === 200) {
            console.log("Task created successfully");
        }
        else {
            console.error("Unexpected response status:", response.status);
            throw new Error(`Failed to create task: ${response.statusText}`);
        }
    }
    async getProviderUrl(providerAddress, serviceName) {
        const service = await this.contract.getService(providerAddress, serviceName);
        return service.url;
    }
    async getTaskProgress(providerAddress, serviceName, customerAddress) {
        const url = await this.getProviderUrl(providerAddress, serviceName);
        // Construct the API endpoint
        const endpoint = `${url}/v1/latest-task-progress/${encodeURIComponent(customerAddress)}`;
        // Make the GET request to fetch the file
        const response = await axios_1.default.get(endpoint, { responseType: "arraybuffer" });
        // Check if the response contains the file data
        if (response.status === 200) {
            // Convert the buffer to a string assuming UTF-8 encoding
            const fileContents = Buffer.from(response.data).toString("utf-8");
            // Return the file contents
            return fileContents;
        }
        throw new Error("Invalid response status or format");
    }
    async getLatestTask(providerAddress, serviceName, customerAddress) {
        const url = await this.getProviderUrl(providerAddress, serviceName);
        // Construct the API endpoint with customerAddress as a path parameter
        const endpoint = `${url}/v1/latest-task/${encodeURIComponent(customerAddress)}`;
        // Make the GET request to fetch the file
        const response = await axios_1.default.get(endpoint, { responseType: "arraybuffer" });
        // Validate and map the response to the Task interface
        const task = response.data;
        // Optional: Add validation logic if needed
        if (!task.id) {
            throw new Error("Invalid task data");
        }
        return task;
    }
}
exports.Provider = Provider;
//# sourceMappingURL=provider.js.map