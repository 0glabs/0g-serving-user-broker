import axios from "axios";
import { FineTuningServingContract } from "../contract";

export interface Task {
    id: string;
    createdAt?: string;
    updatedAt?: string;
    customerAddress: string;
    preTrainedModelHash: string;
    datasetHash: string;
    trainingParams: string;
    outputRootHash?: string;
    isTurbo: boolean;
    progress: string;
    fee: string;
    nonce: string;
    signature: string;
    secret: string;
    encryptedSecret: string;
    teeSignature?: string;
}

export class Provider {
    private contract: FineTuningServingContract

    constructor (contract: FineTuningServingContract) {
        this.contract = contract
    }

    async createTask(
        modelHash: string,
        rootHash: string,
        isTurbo: boolean,
        providerAddress: string,
        serviceName: string,
        fee: string,
        trainingParams: string,
    ): Promise<void> {
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
        const response = await axios.post(endpoint, payload, {
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (response.status === 200) {
            console.log("Task created successfully");
        } else {
            console.error("Unexpected response status:", response.status);
            throw new Error(`Failed to create task: ${response.statusText}`);
        }

    }

    async getProviderUrl(providerAddress: string, serviceName: string): Promise<string> {
        const service = await this.contract.getService(providerAddress, serviceName)
        return service.url
    }

    async getTaskProgress(providerAddress: string, serviceName: string, customerAddress: string): Promise<string> {

        const url = await this.getProviderUrl(providerAddress, serviceName);
        // Construct the API endpoint
        const endpoint = `${url}/v1/latest-task-progress/${encodeURIComponent(customerAddress)}`;

        // Make the GET request to fetch the file
        const response = await axios.get(endpoint, { responseType: "arraybuffer" });

        // Check if the response contains the file data
        if (response.status === 200) {
            // Convert the buffer to a string assuming UTF-8 encoding
            const fileContents = Buffer.from(response.data).toString("utf-8");

            // Return the file contents
            return fileContents;
        }

        throw new Error("Invalid response status or format");

    }

    async getLatestTask(providerAddress: string, serviceName: string, customerAddress: string): Promise<Task> {
        const url = await this.getProviderUrl(providerAddress, serviceName);
        // Construct the API endpoint with customerAddress as a path parameter
        const endpoint = `${url}/v1/latest-task/${encodeURIComponent(customerAddress)}`;

        // Make the GET request to fetch the file
        const response = await axios.get(endpoint, { responseType: "arraybuffer" });

        // Validate and map the response to the Task interface
        const task: Task = response.data;

        // Optional: Add validation logic if needed
        if (!task.id) {
            throw new Error("Invalid task data");
        }

        return task;

    }
}

