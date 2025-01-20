import { exec } from 'child_process'
import { promisify } from 'util'
import { INDEXER_URL_STANDARD, ZG_RPC_ENDPOINT_TESTNET } from '../const'
import path from 'path'

const execAsync = promisify(exec)

export async function upload(
    privateKey: string,
    dataPath: string
): Promise<string> {
    try {
        const command = path.join(
            __dirname,
            '..',
            'binary',
            '0g-storage-client'
        )

        const fullCommand = `${command} upload --url ${ZG_RPC_ENDPOINT_TESTNET} --key ${privateKey} --indexer ${INDEXER_URL_STANDARD} --file ${dataPath}`

        const { stdout, stderr } = await execAsync(fullCommand)

        if (stderr) {
            throw new Error(`Error executing command: ${stderr}`)
        }

        const root = extractRootFromOutput(stdout)
        if (!root) {
            throw new Error(`Failed to extract root from output: ${stdout}`)
        }

        return root
    } catch (error) {
        throw error
    }
}

export async function download(
    dataPath: string,
    dataRoot: string
): Promise<void> {
    try {
        const command = path.join(
            __dirname,
            '..',
            'binary',
            '0g-storage-client'
        )

        const fullCommand = `${command} download --file ${dataPath} --indexer ${INDEXER_URL_STANDARD} --root ${dataRoot}`

        const { stdout, stderr } = await execAsync(fullCommand)

        if (stderr) {
            throw new Error(`Error executing download command: ${stderr}`)
        }

        if (
            !stdout.trim().endsWith('Succeeded to validate the downloaded file')
        ) {
            throw new Error(`Failed to download the file: ${stdout}`)
        }
    } catch (error) {
        throw error
    }
}

function extractRootFromOutput(output: string): string | null {
    const regex = /root = ([a-fA-F0-9x,]+)/
    const match = output.match(regex)
    return match ? match[1] : null
}
