#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const tslib_1 = require("tslib");
const util_1 = require("./util");
const const_1 = require("./const");
const cli_table3_1 = tslib_1.__importDefault(require("cli-table3"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
function default_1(program) {
    program
        .command('get-account')
        .description('Retrieve fine-tuning account information')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--provider <address>', 'Provider address')
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', const_1.LEDGER_CA)
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address', const_1.FINE_TUNING_CA)
        .option('--infer', 'get inference account information')
        .action((options) => {
        if (options.infer) {
            // withLedgerBroker(options, async (broker) => {
            //     const account = await broker.ledger.getInferenceAccount(
            //         options.provider
            //     )
            //     console.log(
            //         `Balance: ${account.balance.toString()}, Pending refund: ${account.pendingRefund.toString()}, Provider signer: ${
            //             account.providerSigner
            //         }`
            //     )
            // })
            return;
        }
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            const account = await broker.fineTuning.getAccount(options.provider);
            const table = new cli_table3_1.default({
                head: ['Field', 'Value'],
                colWidths: [35, 85],
            });
            table.push(['Balance (A0GI)', (0, util_1.neuronToA0gi)(account.balance)]);
            table.push([
                'Pending Refund (A0GI)',
                (0, util_1.neuronToA0gi)(account.pendingRefund),
            ]);
            table.push(['Provider Signer', account.providerSigner]);
            account.deliverables.forEach((deliverable, index) => {
                table.push([
                    `Model Root Hash ${index + 1}`,
                    deliverable.modelRootHash,
                ]);
                table.push([
                    `Encrypted Secret ${index + 1}`,
                    (0, util_1.splitIntoChunks)(deliverable.encryptedSecret, 80),
                ]);
            });
            console.log(table.toString());
        });
    });
    program
        .command('list-services')
        .description('List fine-tuning services')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', const_1.LEDGER_CA)
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address', const_1.FINE_TUNING_CA)
        .action((options) => {
        if (options.infer) {
            return;
        }
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            const services = await broker.fineTuning.listService();
            const table = new cli_table3_1.default({
                head: ['Field', 'Value'],
                colWidths: [60, 50],
            });
            services.forEach((service, index) => {
                table.push([
                    chalk_1.default.blue(`Provider ${index + 1}`),
                    chalk_1.default.blue(service.provider),
                ]);
                table.push(['Service Name', service.name]);
                table.push(['URL', service.url]);
                table.push([
                    'Quota(CPU, Memory, GPU Count, Storage, CPU Type)',
                    service.quota.toString(),
                ]);
                table.push([
                    'Price Per Byte in Dataset',
                    service.pricePerToken.toString(),
                ]);
                table.push(['Occupied', service.occupied.toString()]);
            });
            console.log(table.toString());
        });
    });
}
//# sourceMappingURL=common.js.map