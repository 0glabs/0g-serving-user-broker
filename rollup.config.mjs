import typescript from '@rollup/plugin-typescript'

export default {
    input: 'src.ts/index.ts',
    output: {
        file: 'lib.esm/index.mjs',
        format: 'esm',
        sourcemap: true,
    },
    plugins: [typescript()],
}
