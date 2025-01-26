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
        .command('get-sub-account')
        .description('Retrieve sub account information')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--provider <address>', 'Provider address')
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--infer', 'get sub-account for inference, default is fine-tuning')
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
            if (!broker.fineTuning) {
                console.log('Fine tuning broker is not available.');
                return;
            }
            const { account, refunds } = await broker.fineTuning.getAccountWithDetail(options.provider);
            let table = new cli_table3_1.default({
                head: [chalk_1.default.blue('Field'), chalk_1.default.blue('Value')],
                colWidths: [50, 50],
            });
            table.push(['Provider', account.provider]);
            table.push([
                'Balance (A0GI)',
                (0, util_1.neuronToA0gi)(account.balance).toFixed(18),
            ]);
            table.push([
                'Funds Applied for Return to Main Account (A0GI)',
                (0, util_1.neuronToA0gi)(account.pendingRefund).toFixed(18),
            ]);
            (0, util_1.printTableWithTitle)('Overview', table);
            table = new cli_table3_1.default({
                head: [
                    chalk_1.default.blue('Amount (A0GI)'),
                    chalk_1.default.blue('Remaining Locked Time'),
                ],
                colWidths: [50, 50],
            });
            refunds.forEach((refund) => {
                const totalSeconds = Number(refund.remainTime);
                const hours = Math.floor(totalSeconds / 3600);
                const minutes = Math.floor((totalSeconds % 3600) / 60);
                const secs = totalSeconds % 60;
                table.push([
                    (0, util_1.neuronToA0gi)(refund.amount).toFixed(18),
                    `${hours}h ${minutes}min ${secs}s`,
                ]);
            });
            (0, util_1.printTableWithTitle)('Details of Each Amount Applied for Return to Main Account', table);
            table = new cli_table3_1.default({
                head: [
                    chalk_1.default.blue('Root Hash'),
                    chalk_1.default.blue('Access Confirmed'),
                ],
                colWidths: [75, 25],
            });
            account.deliverables.forEach((deliverable) => {
                table.push([
                    deliverable.modelRootHash,
                    deliverable.acknowledged
                        ? chalk_1.default.greenBright.bold('\u2713')
                        : '',
                ]);
            });
            (0, util_1.printTableWithTitle)('nDeliverables', table);
        });
    });
    program
        .command('list-providers')
        .description('List fine-tuning providers')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
        if (options.infer) {
            return;
        }
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            const services = await broker.fineTuning.listService();
            const table = new cli_table3_1.default({
                colWidths: [50, 50],
            });
            services.forEach((service, index) => {
                table.push([
                    chalk_1.default.blue(`Provider ${index + 1}`),
                    chalk_1.default.blue(service.provider),
                ]);
                let available = !service.occupied ? '\u2713' : `\u2717`;
                if (service.providerSigner) {
                }
                table.push(['Available', available]);
                table.push([
                    'Price Per Byte in Dataset (A0GI)',
                    (0, util_1.neuronToA0gi)(service.pricePerToken).toFixed(18),
                ]);
                table.push(['URL', service.url]);
                // TODO: Show quota when backend ready
                // table.push([
                //     'Quota(CPU, Memory, GPU Count, Storage, CPU Type)',
                //     service.quota.toString(),
                // ])
            });
            console.log(table.toString());
        });
    });
    program
        .command('retrieve-fund')
        .description('Retrieve fund from sub account')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--infer', 'Retrieve fund from sub accounts for inference, default is fine-tuning')
        .action((options) => {
        (0, util_1.withFineTuningBroker)(options, async (broker) => {
            console.log('Retrieving funds from sub accounts...');
            await broker.ledger.retrieveFund(options.infer ? 'inference' : 'fine-tuning');
            console.log('Funds retrieved from sub accounts');
        });
    });
}
//# sourceMappingURL=common.js.map