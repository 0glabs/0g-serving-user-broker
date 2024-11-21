import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'

export default {
    input: 'src.ts/index.ts',
    output: {
        file: 'lib.esm/index.mjs',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [
        resolve(),
        commonjs(),
        typescript({
            tsconfig: './tsconfig.esm.json',
        }),
    ],
    external: ['ethers', 'crypto-js', 'circomlibjs', 'fs'],
}
