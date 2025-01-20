"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZGStorage = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const const_1 = require("../const");
// Promisify exec for async/await support
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ZGStorage {
    getInderUrl(isTurbo) {
        return isTurbo ? const_1.INDEXER_URL_TURBO : const_1.INDEXER_URL_STANDARD;
    }
    async upload(privateKey, dataPath, isTurbo) {
        const indexerUrl = this.getInderUrl(isTurbo);
        // Construct the command
        const command = `./0g-storage-client upload --url ${const_1.ZG_RPC_ENDPOINT_TESTNET} --key ${privateKey} --indexer ${indexerUrl} --file ${dataPath}`;
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
    async download(dataPath, dataRoot, isTurbo) {
        const indexerUrl = const_1.INDEXER_URL_STANDARD;
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
    extractRootFromOutput(output) {
        // Regular expression to match "root = <value>"
        const regex = /root = ([a-fA-F0-9x,]+)/;
        // Execute the regex and extract the value
        const match = output.match(regex);
        // Return the extracted value or null if no match is found
        return match ? match[1] : null;
    }
}
exports.ZGStorage = ZGStorage;
//# sourceMappingURL=zg-storage.js.map