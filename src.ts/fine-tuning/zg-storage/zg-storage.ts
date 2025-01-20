import { exec } from 'child_process'
import { promisify } from 'util'
import { INDEXER_URL_STANDARD, ZG_RPC_ENDPOINT_TESTNET } from '../const'

const execAsync = promisify(exec)

export class ZGStorage {
    async upload(privateKey: string, dataPath: string): Promise<string> {
        const command = `./0g-storage-client upload --url ${ZG_RPC_ENDPOINT_TESTNET} --key ${privateKey} --indexer ${INDEXER_URL_STANDARD} --file ${dataPath}`

        const { stdout, stderr } = await execAsync(command)

        if (stderr) {
            throw new Error(`Error executing command: ${stderr}`)
        }

        const root = this.extractRootFromOutput(stdout)

        if (!root) {
            throw new Error(`Failed to extract root from output: ${stdout}`)
        }

        return root
    }

    async download(dataPath: string, dataRoot: string): Promise<void> {
        const command = `./0g-storage-client download --file ${dataPath} --indexer ${INDEXER_URL_STANDARD} --root ${dataRoot}`

        const { stdout, stderr } = await execAsync(command)

        if (stderr) {
            throw new Error(`Error executing download command: ${stderr}`)
        }

        if (
            !stdout.trim().endsWith('Succeeded to validate the downloaded file')
        ) {
            throw new Error(`Failed to download the file: ${stdout}`)
        }
    }

    extractRootFromOutput(output: string): string | null {
        const regex = /root = ([a-fA-F0-9x,]+)/

        const match = output.match(regex)

        return match ? match[1] : null
    }
}
