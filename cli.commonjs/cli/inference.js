#!/usr/bin/env ts-node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = inference;
const util_1 = require("./util");
function inference(program) {
    program
        .command('ack-provider')
        .description('verify TEE remote attestation of service')
        .requiredOption('--provider <address>', 'Provider address')
        .option('--key <key>', 'Wallet private key, if not provided, ensure the default key is set in the environment', process.env.ZG_PRIVATE_KEY)
        .option('--rpc <url>', '0G Chain RPC endpoint')
        .option('--ledger-ca <address>', 'Account (ledger) contract address')
        .option('--fine-tuning-ca <address>', 'Fine Tuning contract address')
        .option('--gas-price <price>', 'Gas price for transactions')
        .action((options) => {
        (0, util_1.withBroker)(options, async (broker) => {
            await broker.inference.acknowledgeProviderSigner(options.provider, options.gasPrice);
            console.log('Provider acknowledged successfully!');
        });
    });
}
//# sourceMappingURL=inference.js.map