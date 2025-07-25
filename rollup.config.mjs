import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json'
import nodePolyfills from 'rollup-plugin-polyfill-node'

export default [
    {
        input: 'src.ts/sdk/index.ts',
        output: {
            dir: 'lib.esm',
            format: 'esm',
            sourcemap: true,
            entryFileNames: 'index.mjs',
        },
        plugins: [
            json(),
            resolve({
                browser: true,
                preferBuiltins: false
            }),
            commonjs(),
            nodePolyfills({
                include: ['crypto', 'stream', 'util', 'buffer']
            }),
            typescript({
                tsconfig: './tsconfig.esm.json',
            }),
        ],
        external: ['ethers', 'crypto-js', 'circomlibjs', 'child_process', 'fs', 'fs/promises', 'path', 'os', 'crypto', 'readline'],
    },
    {
        input: 'lib.esm/index.d.ts',
        output: {
            file: 'lib.esm/index.d.ts',
            format: 'es',
        },
        plugins: [dts()],
    },
]
