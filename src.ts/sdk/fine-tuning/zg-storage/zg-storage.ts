import { INDEXER_URL_TURBO, ZG_RPC_ENDPOINT_TESTNET } from '../const'
import { spawn } from 'child_process'
import path from 'path'
import * as fs from 'fs/promises'

export async function upload(
    privateKey: string,
    dataPath: string
): Promise<void> {
    try {
        const fileSize = await getFileContentSize(dataPath)

        return new Promise((resolve, reject) => {
            const command = path.join(
                __dirname,
                '..',
                '..',
                '..',
                '..',
                'binary',
                '0g-storage-client'
            )

            const args = [
                'upload',
                '--url',
                ZG_RPC_ENDPOINT_TESTNET,
                '--key',
                privateKey,
                '--indexer',
                INDEXER_URL_TURBO,
                '--file',
                dataPath,
            ]

            const process = spawn(command, args)

            process.stdout.on('data', (data) => {
                console.log(`${data}`)
            })

            process.stderr.on('data', (data) => {
                console.error(`${data}`)
            })

            process.on('close', (code) => {
                if (code !== 0) {
                    reject(new Error(`Process exited with code ${code}`))
                } else {
                    console.log(`File size: ${fileSize} bytes`)
                    resolve()
                }
            })

            process.on('error', (err) => {
                reject(err)
            })
        })
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function download(
    dataPath: string,
    dataRoot: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        const command = path.join(
            __dirname,
            '..',
            'binary',
            '0g-storage-client'
        )

        const args = [
            'download',
            '--file',
            dataPath,
            '--indexer',
            INDEXER_URL_TURBO,
            '--root',
            dataRoot,
        ]

        const process = spawn(command, args)

        let stdoutData = ''
        let stderrData = ''

        process.stdout.on('data', (data) => {
            const output = data.toString()
            stdoutData += output
            console.log(`stdout: ${output}`)
        })

        process.stderr.on('data', (data) => {
            const errorOutput = data.toString()
            stderrData += errorOutput
            console.error(`stderr: ${errorOutput}`)
        })

        process.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Process exited with code ${code}`))
            }

            if (
                !stdoutData
                    .trim()
                    .endsWith('Succeeded to validate the downloaded file')
            ) {
                return reject(
                    new Error(`Failed to download the file: ${stdoutData}`)
                )
            }

            resolve()
        })

        process.on('error', (err) => {
            reject(err)
        })
    })
}

async function getFileContentSize(filePath: string): Promise<number> {
    try {
        const fileHandle = await fs.open(filePath, 'r')
        try {
            const stats = await fileHandle.stat()
            return stats.size
        } finally {
            await fileHandle.close()
        }
    } catch (err) {
        throw new Error(
            `Error processing file: ${
                err instanceof Error ? err.message : String(err)
            }`
        )
    }
}
