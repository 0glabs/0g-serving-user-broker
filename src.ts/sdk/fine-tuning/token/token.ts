import * as fs from 'fs/promises'
import * as os from 'os'
import * as path from 'path'
import AdmZip from 'adm-zip'
import { spawn, exec } from 'child_process'

import { download } from '../zg-storage'

export async function calculateTokenSizeViaExe(
    tokenizerRootHash: string,
    datasetPath: string,
    datasetType: string,
    tokenCounterMerkleRoot: string
): Promise<number> {
    const executorDir = path.join(__dirname, '..', '..', '..', '..', 'binary')
    const versionFile = path.join(executorDir, 'token_counter.ver')
    const binaryFile = path.join(executorDir, 'token_counter')

    let needDownload = false
    try {
        await fs.access(versionFile)
        // Todo: calculate merkle root from file
        const localRoot = await fs.readFile(versionFile, 'utf-8')
        if (tokenCounterMerkleRoot !== localRoot) {
            needDownload = true
        }
    } catch (error) {
        console.log(`File ${versionFile} does not exist.`)
        needDownload = true
    }

    if (!needDownload) {
        try {
            await fs.access(binaryFile)
        } catch (error) {
            console.log(`File ${binaryFile} does not exist.`)
            needDownload = true
        }
    }

    if (needDownload) {
        try {
            await fs.unlink(versionFile)
        } catch (error) {
            console.error(`Failed to delete ${versionFile}:`, error)
        }

        try {
            await fs.unlink(binaryFile)
        } catch (error) {
            console.error(`Failed to delete ${binaryFile}:`, error)
        }

        console.log(`Downloading ${binaryFile}`)
        await download(binaryFile, tokenCounterMerkleRoot)
        await fs.chmod(binaryFile, 0o755)
        await fs.writeFile(versionFile, tokenCounterMerkleRoot, 'utf8')
    }

    return await calculateTokenSize(
        tokenizerRootHash,
        datasetPath,
        datasetType,
        binaryFile,
        []
    )
}

export async function calculateTokenSizeViaPython(
    tokenizerRootHash: string,
    datasetPath: string,
    datasetType: string
): Promise<number> {
    const isPythonInstalled = await checkPythonInstalled()
    if (!isPythonInstalled) {
        throw new Error(
            'Python is required but not installed. Please install Python first.'
        )
    }

    for (const packageName of ['transformers', 'datasets']) {
        const isPackageInstalled = await checkPackageInstalled(packageName)
        if (!isPackageInstalled) {
            console.log(`${packageName} is not installed. Installing...`)
            try {
                await installPackage(packageName)
            } catch (error) {
                throw new Error(`Failed to install ${packageName}: ${error}`)
            }
        }
    }
    const projectRoot = path.resolve(__dirname, '../../../../')
    return await calculateTokenSize(
        tokenizerRootHash,
        datasetPath,
        datasetType,
        'python3',
        [path.join(projectRoot, 'token.counter', 'token_counter.py')]
    )
}

async function calculateTokenSize(
    tokenizerRootHash: string,
    datasetPath: string,
    datasetType: string,
    executor: string,
    args: string[]
): Promise<number> {
    const tmpDir = await fs.mkdtemp(`${os.tmpdir()}${path.sep}`)
    console.log(`current temporary directory ${tmpDir}`)
    const tokenizerPath = path.join(tmpDir, 'tokenizer.zip')

    await download(tokenizerPath, tokenizerRootHash)
    const subDirectories = await getSubdirectories(tmpDir)
    unzipFile(tokenizerPath, tmpDir)
    const newDirectories = new Set<string>()
    for (const item of await getSubdirectories(tmpDir)) {
        if (!subDirectories.has(item)) {
            newDirectories.add(item)
        }
    }

    if (newDirectories.size !== 1) {
        throw new Error('Invalid tokenizer directory')
    }
    const tokenizerUnzipPath = path.join(tmpDir, Array.from(newDirectories)[0])

    let datasetUnzipPath = datasetPath
    if (await isZipFile(datasetPath)) {
        unzipFile(datasetPath, tmpDir)
        datasetUnzipPath = path.join(tmpDir, 'data')
        try {
            await fs.access(datasetUnzipPath)
        } catch (error) {
            await fs.mkdir(datasetUnzipPath, { recursive: true })
        }
    }

    return runExecutor(executor, [
        ...args,
        datasetUnzipPath,
        datasetType,
        tokenizerUnzipPath,
    ])
        .then((output) => {
            console.log('token_counter script output:', output)
            const [num1, num2] = output
                .split(' ')
                .map((str) => parseInt(str, 10))
            if (isNaN(num1) || isNaN(num2)) {
                throw new Error('Invalid number')
            }
            return num1
        })
        .catch((error) => {
            console.error('Error running Python script:', error)
            throw error
        })
}

function checkPythonInstalled(): Promise<boolean> {
    return new Promise((resolve, reject) => {
        exec('python3 --version', (error, stdout, stderr) => {
            if (error) {
                console.error('Python is not installed or not in PATH')
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

function checkPackageInstalled(packageName: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
        exec(`pip show ${packageName}`, (error, stdout, stderr) => {
            if (error) {
                resolve(false)
            } else {
                resolve(true)
            }
        })
    })
}

function installPackage(packageName: string): Promise<void> {
    return new Promise((resolve, reject) => {
        exec(`pip install ${packageName}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Failed to install ${packageName}`)
                reject(error)
            } else {
                console.log(`${packageName} installed successfully`)
                resolve()
            }
        })
    })
}

function runExecutor(executor: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
        console.log(`Run ${executor} ${args}`)
        const pythonProcess = spawn(executor, [...args])

        let output = ''
        let errorOutput = ''

        pythonProcess.stdout.on('data', (data) => {
            output += data.toString()
        })

        pythonProcess.stderr.on('data', (data) => {
            errorOutput += data.toString()
            console.error(`Python error: ${errorOutput}`)
        })

        pythonProcess.on('close', (code) => {
            if (code === 0) {
                resolve(output.trim())
            } else {
                reject(
                    `Python script failed with code ${code}: ${errorOutput.trim()}`
                )
            }
        })
    })
}

function unzipFile(zipFilePath: string, targetDir: string): void {
    try {
        const zip = new AdmZip(zipFilePath)
        zip.extractAllTo(targetDir, true)
        console.log(`Successfully unzipped to ${targetDir}`)
    } catch (error) {
        console.error('Error during unzipping:', error)
        throw error
    }
}

async function isZipFile(targetPath: string): Promise<boolean> {
    try {
        const stats = await fs.stat(targetPath)
        return (
            stats.isFile() && path.extname(targetPath).toLowerCase() === '.zip'
        )
    } catch (error) {
        return false
    }
}

async function getSubdirectories(dirPath: string): Promise<Set<string>> {
    try {
        const entries = await fs.readdir(dirPath, { withFileTypes: true })
        const subdirectories = new Set(
            entries
                .filter((entry) => entry.isDirectory()) // Only keep directories
                .map((entry) => entry.name)
        )

        return subdirectories
    } catch (error) {
        console.error('Error reading directory:', error)
        return new Set()
    }
}
