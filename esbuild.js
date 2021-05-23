const pkg = require('./package.json');
const esbuild = require('esbuild');

/**
 * @type {esbuild.BuildOptions[]}
 */
const configs = [
  {
    format: 'cjs',
    entryNames: '[dir]/[name]',
  },
  {
    format: 'esm',
    entryNames: '[dir]/[name].esm',
  },
];

configs.forEach(options =>
  esbuild.build({
    ...options,
    external: Object.keys(pkg.peerDependencies),
    entryPoints: ['./src/index.ts'],
    outdir: './dist',
    bundle: true,
    target: 'es2020',
    platform: 'neutral',
    // minify: true,
  })
);
