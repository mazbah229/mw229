import path from 'node:path'
import babel from '@rollup/plugin-babel'
import terser from '@rollup/plugin-terser'
import bundleSize from 'rollup-plugin-bundle-size'

export default function generateRollupConfig() {
  // Add bit-assist.js configuration
  return [
    {
      input: path.resolve(__dirname, 'bit-assist.js'),
      external: ['window', 'document'],
      plugins: [bundleSize(), babel({ exclude: 'node_modules/**', babelHelpers: 'bundled' }), terser()],
      output: [
        {
          file: '../iframe/bit-assist.js',
          format: 'iife',
          globals: {
            document: 'document',
            window: 'window',
          },
        },
      ],
    },
  ]
}
