import axios from "axios";
import fs from "fs/promises"; // For reading file contents

export interface TaskProgressArgs {
    url: string;   // Base URL of the service
    taskId: string; // Task ID to fetch the progress
}

export class Provider {
    async getTaskProgress(args: TaskProgressArgs): Promise<string> {
        const { url, taskId } = args;

        // Construct the API endpoint
        const endpoint = `${url}/task-progress/${taskId}`;

        try {
            // Make the GET request to fetch the file
            const response = await axios.get(endpoint, { responseType: "arraybuffer" });

            // Check if the response contains the file data
            if (response.status === 200) {
                // Save the file locally (optional)
                const tempFilePath = `/tmp/${taskId}.txt`; // Adjust the temp file path as needed
                await fs.writeFile(tempFilePath, Buffer.from(response.data));

                // Read the file contents
                const fileContents = await fs.readFile(tempFilePath, "utf-8");

                // Optionally delete the file after reading
                await fs.unlink(tempFilePath);

                // Return the file contents
                return fileContents;
            }

            throw new Error("Invalid response status or format");
        } catch (error) {
            console.error("Failed to fetch and read task progress file:", error.message);
            throw new Error(`Error fetching task progress: ${error.message}`);
        }
    }
}

