"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLedgerTable = void 0;
exports.default = ledger;
const tslib_1 = require("tslib");
const const_1 = require("./const");
const util_1 = require("./util");
const cli_table3_1 = tslib_1.__importDefault(require("cli-table3"));
function ledger(program) {
    program
        .command('get-ledger')
        .description('Retrieve ledger information')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', const_1.LEDGER_CA)
        .action((options) => {
        (0, util_1.withLedgerBroker)(options, async (broker) => {
            (0, exports.getLedgerTable)(broker);
        });
    });
    program
        .command('add-ledger')
        .description('Add ledger balance')
        .requiredOption('--amount <A0GI>', 'Ledger balance to add')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', const_1.LEDGER_CA)
        .action((options) => {
        (0, util_1.withLedgerBroker)(options, async (broker) => {
            await broker.ledger.addLedger(parseFloat(options.amount));
            (0, exports.getLedgerTable)(broker);
        });
    });
    program
        .command('deposit')
        .description('Deposit funds into the ledger')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('--amount <A0GI>', 'Amount of funds to deposit')
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', const_1.LEDGER_CA)
        .action((options) => {
        (0, util_1.withLedgerBroker)(options, async (broker) => {
            await broker.ledger.depositFund(parseFloat(options.amount));
            console.log('Deposited funds:', options.amount, 'A0GI');
            (0, exports.getLedgerTable)(broker);
        });
    });
    program
        .command('refund')
        .description('Refund an amount from the ledger')
        .option('--key <key>', 'Wallet private key', process.env.ZG_PRIVATE_KEY)
        .requiredOption('-a, --amount <A0GI>', 'Amount to refund')
        .option('--rpc <url>', '0G Chain RPC endpoint', const_1.ZG_RPC_ENDPOINT_TESTNET)
        .option('--ledger-ca <address>', 'Ledger contract address', const_1.LEDGER_CA)
        .action((options) => {
        (0, util_1.withLedgerBroker)(options, async (broker) => {
            await broker.ledger.refund(parseFloat(options.amount));
            console.log('Refunded amount:', options.amount);
            (0, exports.getLedgerTable)(broker);
        });
    });
}
const getLedgerTable = async (broker) => {
    // Ledger information
    const { ledgerInfo, infers, fines } = await broker.ledger.getLedger();
    let table = new cli_table3_1.default({
        head: ['Balance', 'Value (A0GI)'],
        colWidths: [50, 80],
    });
    table.push(['Available Balance', String(ledgerInfo[1])]);
    table.push([
        'Locked Balance (transferred to sub-accounts)',
        String(ledgerInfo[0] - ledgerInfo[1]),
    ]);
    console.log('\nLedger Information\n' + table.toString());
    // Inference information
    if (infers && infers.length !== 0) {
        let table = new cli_table3_1.default({
            head: [
                'Provider',
                'Balance (A0GI)',
                'Balance to Be Retrieved (A0GI)',
            ],
            colWidths: [50, 30, 50],
        });
        for (const infer of infers) {
            table.push([infer[0], infer[1], infer[2]]);
        }
        console.log('\nSub-accounts for Inference\n' + table.toString());
    }
    // Fine tuning information
    if (fines && fines.length !== 0) {
        let table = new cli_table3_1.default({
            head: [
                'Provider',
                'Balance (A0GI)',
                'Balance to Be Retrieved (A0GI)',
            ],
            colWidths: [50, 30, 50],
        });
        for (const fine of fines) {
            table.push([fine[0], fine[1], fine[2]]);
        }
        console.log('\nSub-account for Fine-Tuning\n' + table.toString());
    }
};
exports.getLedgerTable = getLedgerTable;
//# sourceMappingURL=ledger.js.map