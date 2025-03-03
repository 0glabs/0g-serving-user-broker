import * as fs from 'fs/promises'
import * as os from 'os';
import * as path from 'path';
import AdmZip from 'adm-zip';
import { spawn } from 'child_process';

import { download } from '../zg-storage'


export async function calculateTokenSize(
    tokenizerRootHash: string,
    datasetPath: string,
    datasetType: string,
): Promise<number> {
    const tmpDir = await fs.mkdtemp(`${os.tmpdir()}${path.sep}`)
    console.log(`current temporary directory ${tmpDir}`)
    const tokenizerPath = path.join(tmpDir, 'tokenizer.zip')

    await download(tokenizerPath, tokenizerRootHash)
    const tokenizerUnzipPath = path.join(tmpDir, 'tokenizer')
    await fs.mkdir(tokenizerUnzipPath)
    unzipFile(tokenizerPath, tokenizerUnzipPath);

    let datasetUnzipPath = datasetPath
    if (await isZipFile(datasetPath)) {
        unzipFile(datasetPath, tmpDir);
        datasetUnzipPath = path.join(tmpDir, 'data');
        try {
            await fs.access(datasetUnzipPath);
        } catch (error) {
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
            return num1
        })
        .catch((error) => {
            console.error('Error running Python script:', error);
            throw error;
        });
}



function runPythonScript(scriptPath: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        const pythonProcess = spawn('python3', [scriptPath, ...args]);

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
            } else {
                reject(`Python script failed with code ${code}: ${errorOutput.trim()}`);
            }
        });
    });
}

function unzipFile(zipFilePath: string, targetDir: string): void {
    try {
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(targetDir, true);
        console.log(`Successfully unzipped to ${targetDir}`);
    } catch (error) {
        console.error("Error during unzipping:", error);
        throw error;
    }

}

async function isZipFile(targetPath: string): Promise<boolean> {
    try {
        const stats = await fs.stat(targetPath);
        return stats.isFile() && path.extname(targetPath).toLowerCase() === '.zip';
    } catch (error) {
        return false;
    }
}
