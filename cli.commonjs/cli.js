#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const ethers_1 = require("ethers");
const sdk_1 = require("./sdk"); // 替换为你 SDK 的文件路径
const program = new commander_1.Command();
program
    .name('zg-cli')
    .description('CLI for interacting with ZG Compute Network')
    .version('1.0.0');
async function initBroker(options) {
    const provider = new ethers_1.ethers.JsonRpcProvider(options.provider);
    const wallet = new ethers_1.ethers.Wallet(options.privateKey, provider);
    return await (0, sdk_1.createZGComputeNetworkBroker)(wallet, options.ledgerCa, options.inferenceCa, options.fineTuningCa);
}
program
    .command('list-service')
    .description('List fine-tuning services')
    .requiredOption('-p, --provider <url>', '0G Chain provider URL')
    .requiredOption('-k, --private-key <key>', 'Wallet private key')
    .option('-l, --ledger-ca <address>', 'Ledger contract address', '')
    .option('-i, --inference-ca <address>', 'Inference contract address', '0xE7F0998C83a81f04871BEdfD89aB5f2DAcDBf435')
    .option('-f, --fine-tuning-ca <address>', 'Fine Tuning contract address', '')
    .action(async (options) => {
    try {
        const broker = await initBroker(options);
        if (broker.inference) {
            const services = await broker.inference.listService();
            console.log('Services:', services);
        }
        else {
            console.log('Fine tuning broker is not available.');
        }
    }
    catch (error) {
        console.error('Failed to list services:', error);
    }
});
program.parse(process.argv);
//# sourceMappingURL=cli.js.map