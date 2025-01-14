
// @ts-ignore
import {createZGServingNetworkBroker} from '../src.ts/broker'
import { ethers } from 'ethers'

async function main() {
    const provider = new ethers.JsonRpcProvider('https://evmrpc-testnet.0g.ai')
    const privateKey =
        '1A6338193E6C204381E6C68BB0F60DC1B83418D7C9B5C928C4FB99E917702261'
    const wallet = new ethers.Wallet(privateKey, provider)

    try {
        const broker = createZGServingNetworkBroker(wallet)
        const services = await broker.listService()


    }

}
