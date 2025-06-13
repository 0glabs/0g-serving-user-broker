#!/usr/bin/env node

import { Command } from 'commander'
import fineTuning from './fine-tuning'
import ledger from './ledger'
import common from './common'
import inference from './inference'

export const program = new Command()

program
    .name('0g-serving-broker')
    .description('CLI for interacting with ZG Compute Network')
    .version('dev')

fineTuning(program)
inference(program)
ledger(program)
common(program)

program.parse(process.argv)
