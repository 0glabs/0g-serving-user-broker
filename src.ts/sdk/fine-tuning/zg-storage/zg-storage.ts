import { INDEXER_URL_TURBO, ZG_RPC_ENDPOINT_TESTNET } from '../const'
import { spawn } from 'child_process'
import path from 'path'
import * as fs from 'fs/promises'

export async function upload(
    privateKey: string,
    dataPath: string,
    gasPrice?: number,
    maxGasPrice?: number
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
                '--skip-tx=false',
                '--log-level=debug',
            ]

            if (gasPrice) {
                args.push('--gas-price', gasPrice.toString())
            }

            if (maxGasPrice) {
                args.push('--max-gas-price', maxGasPrice.toString())
            }

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
            '..',
            '..',
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
            '--roots',
            dataRoot,
        ]

        const process = spawn(command, args)

        let log = ''

        process.stdout.on('data', (data) => {
            const output = data.toString()
            log += output
            console.log(output)
        })

        process.stderr.on('data', (data) => {
            const errorOutput = data.toString()
            log += errorOutput
            console.error(errorOutput)
        })

        process.on('close', (code) => {
            if (code !== 0) {
                return reject(new Error(`Process exited with code ${code}`))
            }

            if (
                !log
                    .trim()
                    .endsWith('Succeeded to validate the downloaded file')
            ) {
                return reject(new Error('Failed to download the file'))
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
