import common from '@rollup/plugin-commonjs';
import node from '@rollup/plugin-node-resolve';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';
import typescript from '@rollup/plugin-typescript';

const configs = [
  {
    output: {
      dir: './dist',
      format: 'es',
      entryFileNames: '[name].esm.js',
    },
  },
  {
    output: {
      dir: './dist',
      format: 'cjs',
      entryFileNames: '[name].js',
    },
  },
];

export default configs.map(options => ({
  ...options,
  external: Object.keys(pkg.peerDependencies),
  input: [
    './src/index.ts',
    './src/react.ts',
    './src/immutable.ts',
    './src/reducible.ts',
  ],
  plugins: [node(), common(), typescript(), terser()],
}));
