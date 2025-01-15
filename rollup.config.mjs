import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import dts from 'rollup-plugin-dts'
import json from '@rollup/plugin-json';

export default [
    {
        input: 'src.ts/index.ts',
        output: {
            file: 'lib.esm/index.mjs',
            format: 'esm',
            sourcemap: true,
        },
        plugins: [
            json(),
            resolve(),
            commonjs(),
            typescript({
                tsconfig: './tsconfig.esm.json',
            }),
        ],
        external: ['ethers', 'crypto-js', 'circomlibjs'],
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
