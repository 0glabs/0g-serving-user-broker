"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTokenSize = calculateTokenSize;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs/promises"));
const os = tslib_1.__importStar(require("os"));
const path = tslib_1.__importStar(require("path"));
const adm_zip_1 = tslib_1.__importDefault(require("adm-zip"));
const child_process_1 = require("child_process");
const zg_storage_1 = require("../zg-storage");
async function calculateTokenSize(tokenizerRootHash, datasetPath, datasetType) {
    const tmpDir = await fs.mkdtemp(`${os.tmpdir()}${path.sep}`);
    console.log(`current temporary directory ${tmpDir}`);
    const tokenizerPath = path.join(tmpDir, 'tokenizer.zip');
    await (0, zg_storage_1.download)(tokenizerPath, tokenizerRootHash);
    const subDirectories = await getSubdirectories(tmpDir);
    unzipFile(tokenizerPath, tmpDir);
    const newDirectories = new Set();
    for (const item of await getSubdirectories(tmpDir)) {
        if (!subDirectories.has(item)) {
            newDirectories.add(item);
        }
    }
    if (newDirectories.size !== 1) {
        throw new Error('Invalid tokenizer directory');
    }
    const tokenizerUnzipPath = path.join(tmpDir, Array.from(newDirectories)[0]);
    let datasetUnzipPath = datasetPath;
    if (await isZipFile(datasetPath)) {
        unzipFile(datasetPath, tmpDir);
        datasetUnzipPath = path.join(tmpDir, 'data');
        try {
            await fs.access(datasetUnzipPath);
        }
        catch (error) {
            await fs.mkdir(datasetUnzipPath, { recursive: true });
        }
    }
    const projectRoot = path.resolve(__dirname, '../../../../');
    return runPythonScript(path.join(projectRoot, 'token.counter', 'token_counter.py'), [datasetUnzipPath, datasetType, tokenizerUnzipPath])
        .then((output) => {
        console.log('token_counter script output:', output);
        const [num1, num2] = output.split(' ').map((str) => parseInt(str, 10));
        if (isNaN(num1) || isNaN(num2)) {
            throw new Error('Invalid number');
        }
        return num1;
    })
        .catch((error) => {
        console.error('Error running Python script:', error);
        throw error;
    });
}
function runPythonScript(scriptPath, args) {
    return new Promise((resolve, reject) => {
        const pythonProcess = (0, child_process_1.spawn)('python3', [scriptPath, ...args]);
        let output = '';
        let errorOutput = '';
        pythonProcess.stdout.on('data', (data) => {
            output += data.toString();
        });
        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString();
            console.error(`Python error: ${errorOutput}`);
        });
        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim());
            }
            else {
                reject(`Python script failed with code ${code}: ${errorOutput.trim()}`);
            }
        });
    });
}
function unzipFile(zipFilePath, targetDir) {
    try {
        const zip = new adm_zip_1.default(zipFilePath);
        zip.extractAllTo(targetDir, true);
        console.log(`Successfully unzipped to ${targetDir}`);
    }
    catch (error) {
        console.error("Error during unzipping:", error);
        throw error;
    }
}
async function isZipFile(targetPath) {
    try {
        const stats = await fs.stat(targetPath);
        return stats.isFile() && path.extname(targetPath).toLowerCase() === '.zip';
    }
    catch (error) {
        return false;
    }
}
async function getSubdirectories(dirPath) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const subdirectories = new Set(entries
            .filter(entry => entry.isDirectory()) // Only keep directories
            .map(entry => entry.name));
        return subdirectories;
    }
    catch (error) {
        console.error('Error reading directory:', error);
        return new Set();
    }
}
//# sourceMappingURL=token.js.map