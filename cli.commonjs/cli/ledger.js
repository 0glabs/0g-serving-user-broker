#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLedgerTable = void 0;
exports.default = ledger;
const tslib_1 = require("tslib");
const util_1 = require("./util");
const cli_table3_1 = tslib_1.__importDefault(require("cli-table3"));
const chalk_1 = tslib_1.__importDefault(require("chalk"));
function ledger(program) {
    program
        .command('get-account')
        .description('Retrieve account information')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .action((options) => {
        (0, util_1.withBroker)(options, async (broker) => {
            (0, exports.getLedgerTable)(broker);
        });
    });
    program
        .command('add-account')
        .description('Add account balance')
        .requiredOption('--amount <A0GI>', 'Amount to add')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .option('--max-gas-price <price>', 'Max gas price for transactions')
        .option('--step <step>', 'Step for gas price calculation')
        .action((options) => {
        (0, util_1.withBroker)(options, async (broker) => {
            console.log('Adding account...');
            await broker.ledger.addLedger(parseFloat(options.amount));
            console.log('Account Created!');
            (0, exports.getLedgerTable)(broker);
        });
    });
    program
        .command('deposit')
        .description('Deposit funds into the account')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--amount <A0GI>', 'Amount of funds to deposit')
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .option('--max-gas-price <price>', 'Max gas price for transactions')
        .option('--step <step>', 'Step for gas price calculation')
        .action((options) => {
        (0, util_1.withBroker)(options, async (broker) => {
            console.log('Depositing...');
            await broker.ledger.depositFund(parseFloat(options.amount));
            console.log('Deposited funds:', options.amount, 'A0GI');
        });
    });
    program
        .command('refund')
        .description('Refund an amount from the account')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('-a, --amount <A0GI>', 'Amount to refund')
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .option('--max-gas-price <price>', 'Max gas price for transactions')
        .option('--step <step>', 'Step for gas price calculation')
        .action((options) => {
        (0, util_1.withBroker)(options, async (broker) => {
            console.log('Refunding...');
            await broker.ledger.refund(parseFloat(options.amount));
            console.log('Refunded amount:', options.amount, 'A0GI');
        });
    });
    program
        .command('retrieve-fund')
        .description('Retrieve fund from sub account')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--inference-ca <address>', 'Inference contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--infer', 'Retrieve fund from sub accounts for inference, default is fine-tuning')
        .option('--gas-price <price>', 'Gas price for transactions')
        .option('--max-gas-price <price>', 'Max gas price for transactions')
        .option('--step <step>', 'Step for gas price calculation')
        .action((options) => {
        (0, util_1.withBroker)(options, async (broker) => {
            console.log('Retrieving funds from sub accounts...');
            await broker.ledger.retrieveFund(options.infer ? 'inference' : 'fine-tuning');
            console.log('Funds retrieved from sub accounts');
        });
    });
}
const getLedgerTable = async (broker) => {
    // Ledger information
    const { ledgerInfo, infers, fines } = await broker.ledger.ledger.getLedgerWithDetail();
    let table = new cli_table3_1.default({
        head: [chalk_1.default.blue('Balance'), chalk_1.default.blue('Value (A0GI)')],
        colWidths: [50, 81],
    });
    table.push(['Total', (0, util_1.neuronToA0gi)(ledgerInfo[0]).toFixed(18)]);
    table.push([
        'Locked (transferred to sub-accounts)',
        (0, util_1.neuronToA0gi)(ledgerInfo[1]).toFixed(18),
    ]);
    (0, util_1.printTableWithTitle)('Overview', table);
    // Inference information
    if (infers && infers.length !== 0) {
        let table = new cli_table3_1.default({
            head: [
                chalk_1.default.blue('Provider'),
                chalk_1.default.blue('Balance (A0GI)'),
                chalk_1.default.blue('Requested Return to Main Account (A0GI)'),
            ],
            colWidths: [50, 30, 50],
        });
        for (const infer of infers) {
            table.push([
                infer[0],
                (0, util_1.neuronToA0gi)(infer[1]).toFixed(18),
                (0, util_1.neuronToA0gi)(infer[2]).toFixed(18),
            ]);
        }
        (0, util_1.printTableWithTitle)('Inference sub-accounts (Dynamically Created per Used Provider)', table);
    }
    // Fine tuning information
    if (fines && fines.length !== 0) {
        let table = new cli_table3_1.default({
            head: [
                chalk_1.default.blue('Provider'),
                chalk_1.default.blue('Balance (A0GI)'),
                chalk_1.default.blue('Requested Return to Main Account (A0GI)'),
            ],
            colWidths: [50, 30, 50],
        });
        for (const fine of fines) {
            table.push([
                fine[0],
                (0, util_1.neuronToA0gi)(fine[1]).toFixed(18),
                (0, util_1.neuronToA0gi)(fine[2]).toFixed(18),
            ]);
        }
        (0, util_1.printTableWithTitle)('Fine-tuning sub-accounts (Dynamically Created per Used Provider)', table);
    }
};
exports.getLedgerTable = getLedgerTable;
//# sourceMappingURL=ledger.js.map