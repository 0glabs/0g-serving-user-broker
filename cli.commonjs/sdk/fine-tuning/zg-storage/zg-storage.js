"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = upload;
exports.download = download;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const util_1 = require("util");
const const_1 = require("../const");
const path_1 = tslib_1.__importDefault(require("path"));
const execAsync = (0, util_1.promisify)(child_process_1.exec);
async function upload(privateKey, dataPath) {
    try {
        const command = path_1.default.join(__dirname, '..', 'binary', '0g-storage-client');
        const fullCommand = `${command} upload --url ${const_1.ZG_RPC_ENDPOINT_TESTNET} --key ${privateKey} --indexer ${const_1.INDEXER_URL_STANDARD} --file ${dataPath}`;
        const { stdout, stderr } = await execAsync(fullCommand);
        if (stderr) {
            throw new Error(`Error executing command: ${stderr}`);
        }
        const root = extractRootFromOutput(stdout);
        if (!root) {
            throw new Error(`Failed to extract root from output: ${stdout}`);
        }
        return root;
    }
    catch (error) {
        throw error;
    }
}
async function download(dataPath, dataRoot) {
    try {
        const command = path_1.default.join(__dirname, '..', 'binary', '0g-storage-client');
        const fullCommand = `${command} download --file ${dataPath} --indexer ${const_1.INDEXER_URL_STANDARD} --root ${dataRoot}`;
        const { stdout, stderr } = await execAsync(fullCommand);
        if (stderr) {
            throw new Error(`Error executing download command: ${stderr}`);
        }
        if (!stdout.trim().endsWith('Succeeded to validate the downloaded file')) {
            throw new Error(`Failed to download the file: ${stdout}`);
        }
    }
    catch (error) {
        throw error;
    }
}
function extractRootFromOutput(output) {
    const regex = /root = ([a-fA-F0-9x,]+)/;
    const match = output.match(regex);
    return match ? match[1] : null;
}
//# sourceMappingURL=zg-storage.js.map