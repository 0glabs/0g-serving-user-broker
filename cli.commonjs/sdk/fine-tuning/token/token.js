"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateTokenSizeViaExe = calculateTokenSizeViaExe;
exports.calculateTokenSizeViaPython = calculateTokenSizeViaPython;
const tslib_1 = require("tslib");
const fs = tslib_1.__importStar(require("fs/promises"));
const os = tslib_1.__importStar(require("os"));
const path = tslib_1.__importStar(require("path"));
const adm_zip_1 = tslib_1.__importDefault(require("adm-zip"));
const child_process_1 = require("child_process");
const crypto_1 = require("crypto");
const fs_1 = require("fs");
const zg_storage_1 = require("../zg-storage");
async function calculateTokenSizeViaExe(tokenizerRootHash, datasetPath, datasetType, tokenCounterMerkleRoot, tokenCounterFileHash) {
    const executorDir = path.join(__dirname, '..', '..', '..', '..', 'binary');
    const binaryFile = path.join(executorDir, 'token_counter');
    let needDownload = false;
    try {
        await fs.access(binaryFile);
        console.log('calculating file Hash');
        const hash = await calculateFileHash(binaryFile);
        console.log('file hash: ', hash);
        if (tokenCounterFileHash !== hash) {
            console.log(`file hash mismatch, expected: `, tokenCounterFileHash);
            needDownload = true;
        }
    }
    catch (error) {
        console.log(`File ${binaryFile} does not exist.`);
        needDownload = true;
    }
    if (needDownload) {
        try {
            await fs.unlink(binaryFile);
        }
        catch (error) {
            console.error(`Failed to delete ${binaryFile}:`, error);
        }
        console.log(`Downloading ${binaryFile}`);
        await (0, zg_storage_1.download)(binaryFile, tokenCounterMerkleRoot);
        await fs.chmod(binaryFile, 0o755);
    }
    return await calculateTokenSize(tokenizerRootHash, datasetPath, datasetType, binaryFile, []);
}
async function calculateTokenSizeViaPython(tokenizerRootHash, datasetPath, datasetType) {
    const isPythonInstalled = await checkPythonInstalled();
    if (!isPythonInstalled) {
        throw new Error('Python is required but not installed. Please install Python first.');
    }
    for (const packageName of ['transformers', 'datasets']) {
        const isPackageInstalled = await checkPackageInstalled(packageName);
        if (!isPackageInstalled) {
            console.log(`${packageName} is not installed. Installing...`);
            try {
                await installPackage(packageName);
            }
            catch (error) {
                throw new Error(`Failed to install ${packageName}: ${error}`);
            }
        }
    }
    const projectRoot = path.resolve(__dirname, '../../../../');
    return await calculateTokenSize(tokenizerRootHash, datasetPath, datasetType, 'python3', [path.join(projectRoot, 'token.counter', 'token_counter.py')]);
}
async function calculateTokenSize(tokenizerRootHash, datasetPath, datasetType, executor, args) {
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
    return runExecutor(executor, [
        ...args,
        datasetUnzipPath,
        datasetType,
        tokenizerUnzipPath,
    ])
        .then((output) => {
        console.log('token_counter script output:', output);
        const [num1, num2] = output
            .split(' ')
            .map((str) => parseInt(str, 10));
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
function checkPythonInstalled() {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)('python3 --version', (error, stdout, stderr) => {
            if (error) {
                console.error('Python is not installed or not in PATH');
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
function checkPackageInstalled(packageName) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`pip show ${packageName}`, (error, stdout, stderr) => {
            if (error) {
                resolve(false);
            }
            else {
                resolve(true);
            }
        });
    });
}
function installPackage(packageName) {
    return new Promise((resolve, reject) => {
        (0, child_process_1.exec)(`pip install ${packageName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Failed to install ${packageName}`);
                reject(error);
            }
            else {
                console.log(`${packageName} installed successfully`);
                resolve();
            }
        });
    });
}
function runExecutor(executor, args) {
    return new Promise((resolve, reject) => {
        console.log(`Run ${executor} ${args}`);
        const pythonProcess = (0, child_process_1.spawn)(executor, [...args]);
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
        console.error('Error during unzipping:', error);
        throw error;
    }
}
async function isZipFile(targetPath) {
    try {
        const stats = await fs.stat(targetPath);
        return (stats.isFile() && path.extname(targetPath).toLowerCase() === '.zip');
    }
    catch (error) {
        return false;
    }
}
async function getSubdirectories(dirPath) {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true });
        const subdirectories = new Set(entries
            .filter((entry) => entry.isDirectory()) // Only keep directories
            .map((entry) => entry.name));
        return subdirectories;
    }
    catch (error) {
        console.error('Error reading directory:', error);
        return new Set();
    }
}
async function calculateFileHash(filePath, algorithm = 'sha256') {
    return new Promise((resolve, reject) => {
        const hash = (0, crypto_1.createHash)(algorithm);
        const stream = (0, fs_1.createReadStream)(filePath);
        stream.on('data', (chunk) => {
            hash.update(chunk);
        });
        stream.on('end', () => {
            resolve(hash.digest('hex'));
        });
        stream.on('error', (err) => {
            reject(err);
        });
    });
}
//# sourceMappingURL=token.js.map