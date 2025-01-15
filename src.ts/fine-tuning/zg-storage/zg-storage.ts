import { exec } from "child_process";
import { promisify } from "util";

// Promisify exec for async/await support
const execAsync = promisify(exec);

// Define the UploadArgs type
export interface UploadArgs {
    url: string; // hardcode
    privateKey: string;
    indexerUrl: string; // change to isturbo
    dataPath: string;
}

// Define the DownloadArgs type
export interface DownloadArgs {
    dataPath: string;
    indexerUrl: string;
    dataRoot: string;
}

export class ZGStorage {

    async upload(uploadArgs: UploadArgs): Promise<string> {
        const { url, privateKey, indexerUrl, dataPath } = uploadArgs;

        // Construct the command
        const command = `./0g-storage-client upload --url ${url} --key ${privateKey} --indexer ${indexerUrl} --file ${dataPath}`;

        // Execute the command
        const { stdout, stderr } = await execAsync(command);

        // Check if there's an error in stderr
        if (stderr) {
            throw new Error(`Error executing command: ${stderr}`);
        }

        const root = this.extractRootFromOutput(stdout);

        if (!root) {
            throw new Error(`Failed to extract root from output: ${stdout}`);
        }

        // Return the root hash(s)
        return root;
    
    }

    async download(downloadArgs: DownloadArgs): Promise<void> {
        const { dataPath, indexerUrl, dataRoot } = downloadArgs;

        // Construct the command
        const command = `./0g-storage-client download --file ${dataPath} --indexer ${indexerUrl} --root ${dataRoot}`;

        // Execute the command
        const { stdout, stderr } = await execAsync(command);

        // Check if there's an error in stderr
        if (stderr) {
            throw new Error(`Error executing download command: ${stderr}`);
        }

        // Return the output of the command
        if (!stdout.trim().endsWith('Succeeded to validate the downloaded file')) {
            throw new Error(`Failed to download the file: ${stdout}`);
        }
 
    }

    extractRootFromOutput(output: string): string | null {
        // Regular expression to match "root = <value>"
        const regex = /root = ([a-fA-F0-9x,]+)/;
    
        // Execute the regex and extract the value
        const match = output.match(regex);
    
        // Return the extracted value or null if no match is found
        return match ? match[1] : null;
    }
}
