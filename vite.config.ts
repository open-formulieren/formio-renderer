/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import detectCircularDependencies from 'vite-plugin-circular-dependency';
import dts from 'vite-plugin-dts';
import tsconfigPaths from 'vite-tsconfig-paths';

import {dependencies, peerDependencies} from './package.json';

const __dirname = dirname(fileURLToPath(import.meta.url));

const externalPackages = [
  ...Object.keys(dependencies || {}),
  ...Object.keys(peerDependencies || {}),
];

// Creating regexes of the packages to make sure subpaths of the
// packages are also treated as external
export const packageRegexes = externalPackages.map(
  packageName => new RegExp(`^${packageName}(/.*)?`)
);

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react({
      babel: {
        plugins: [
          [
            'formatjs',
            {
              idInterpolationPattern: '[sha512:contenthash:base64:6]',
              ast: true,
            },
          ],
        ],
      },
    }),
    detectCircularDependencies(),
    dts({tsconfigPath: './tsconfig.prod.json'}),
  ],
  resolve: {
    alias: {
      '@/components': resolve(__dirname, 'src/components'),
      '@/scss': resolve(__dirname, 'src/scss'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {quietDeps: true},
    },
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModules: true,
        preserveModulesRoot: 'src',
        entryFileNames: '[name].js',
      },
      external: packageRegexes,
    },
  },
});
