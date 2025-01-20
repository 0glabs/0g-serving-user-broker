"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZGStorage = void 0;
const child_process_1 = require("child_process");
const util_1 = require("util");
const const_1 = require("../const");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class ZGStorage {
    async upload(privateKey, dataPath) {
        const command = `./0g-storage-client upload --url ${const_1.ZG_RPC_ENDPOINT_TESTNET} --key ${privateKey} --indexer ${const_1.INDEXER_URL_STANDARD} --file ${dataPath}`;
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            throw new Error(`Error executing command: ${stderr}`);
        }
        const root = this.extractRootFromOutput(stdout);
        if (!root) {
            throw new Error(`Failed to extract root from output: ${stdout}`);
        }
        return root;
    }
    async download(dataPath, dataRoot) {
        const command = `./0g-storage-client download --file ${dataPath} --indexer ${const_1.INDEXER_URL_STANDARD} --root ${dataRoot}`;
        const { stdout, stderr } = await execAsync(command);
        if (stderr) {
            throw new Error(`Error executing download command: ${stderr}`);
        }
        if (!stdout.trim().endsWith('Succeeded to validate the downloaded file')) {
            throw new Error(`Failed to download the file: ${stdout}`);
        }
    }
    extractRootFromOutput(output) {
        const regex = /root = ([a-fA-F0-9x,]+)/;
        const match = output.match(regex);
        return match ? match[1] : null;
    }
}
exports.ZGStorage = ZGStorage;
//# sourceMappingURL=zg-storage.js.map