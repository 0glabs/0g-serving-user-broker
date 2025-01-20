import { exec } from "child_process";
import { promisify } from "util";
import { INDEXER_URL_STANDARD, INDEXER_URL_TURBO, ZG_RPC_ENDPOINT_TESTNET } from "../const";

// Promisify exec for async/await support
const execAsync = promisify(exec);

export class ZGStorage {
    getInderUrl(isTurbo: boolean): string {
        return isTurbo ? INDEXER_URL_TURBO : INDEXER_URL_STANDARD;
    }

    async upload(privateKey: string, dataPath: string, isTurbo: boolean): Promise<string> {
        const indexerUrl = this.getInderUrl(isTurbo);

        // Construct the command
        const command = `./0g-storage-client upload --url ${ZG_RPC_ENDPOINT_TESTNET} --key ${privateKey} --indexer ${indexerUrl} --file ${dataPath}`;

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

    async download(dataPath: string, dataRoot: string, isTurbo: boolean): Promise<void> {
        const indexerUrl = INDEXER_URL_STANDARD;

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
