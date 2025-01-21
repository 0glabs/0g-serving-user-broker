"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = upload;
exports.download = download;
const tslib_1 = require("tslib");
const const_1 = require("../const");
const child_process_1 = require("child_process");
const path_1 = tslib_1.__importDefault(require("path"));
const fs = tslib_1.__importStar(require("fs/promises"));
async function upload(privateKey, dataPath) {
    try {
        const fileSize = await getFileContentSize(dataPath);
        return new Promise((resolve, reject) => {
            const command = path_1.default.join(__dirname, '..', '..', '..', '..', 'binary', '0g-storage-client');
            const args = [
                'upload',
                '--url',
                const_1.ZG_RPC_ENDPOINT_TESTNET,
                '--key',
                privateKey,
                '--indexer',
                const_1.INDEXER_URL_TURBO,
                '--file',
                dataPath,
            ];
            const process = (0, child_process_1.spawn)(command, args);
            process.stdout.on('data', (data) => {
                console.log(`${data}`);
            });
            process.stderr.on('data', (data) => {
                console.error(`${data}`);
            });
            process.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Process exited with code ${code}`));
                }
                else {
                    console.log(`File size: ${fileSize} bytes`);
                    resolve();
                }
            });
            process.on('error', (err) => {
                reject(err);
            });
        });
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
async function download(dataPath, dataRoot) {
    return new Promise((resolve, reject) => {
        const command = path_1.default.join(__dirname, '..', 'binary', '0g-storage-client');
        const args = [
            'download',
            '--file',
            dataPath,
            '--indexer',
            const_1.INDEXER_URL_TURBO,
            '--root',
            dataRoot,
        ];
        const process = (0, child_process_1.spawn)(command, args);
        let stdoutData = '';
        let stderrData = '';
        process.stdout.on('data', (data) => {
            const output = data.toString();
            stdoutData += output;
            console.log(`stdout: ${output}`);
        });
        process.stderr.on('data', (data) => {
            const errorOutput = data.toString();
            stderrData += errorOutput;
            console.error(`stderr: ${errorOutput}`);
        });
        process.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Process exited with code ${code}`));
            }
            if (!stdoutData
                .trim()
                .endsWith('Succeeded to validate the downloaded file')) {
                return reject(new Error(`Failed to download the file: ${stdoutData}`));
            }
            resolve();
        });
        process.on('error', (err) => {
            reject(err);
        });
    });
}
async function getFileContentSize(filePath) {
    try {
        const fileHandle = await fs.open(filePath, 'r');
        try {
            const stats = await fileHandle.stat();
            return stats.size;
        }
        finally {
            await fileHandle.close();
        }
    }
    catch (err) {
        throw new Error(`Error processing file: ${err instanceof Error ? err.message : String(err)}`);
    }
}
//# sourceMappingURL=zg-storage.js.map