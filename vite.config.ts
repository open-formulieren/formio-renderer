/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';
import detectCircularDependencies from 'vite-plugin-circular-dependency';
import dts from 'vite-plugin-dts';
import eslint from 'vite-plugin-eslint2';
import tsconfigPaths from 'vite-tsconfig-paths';
import {coverageConfigDefaults} from 'vitest/config';

import {dependencies, peerDependencies} from './package.json';

const _OF_INTERNAL_dirname = dirname(fileURLToPath(import.meta.url));

const externalPackages = [
  ...Object.keys(dependencies || {}),
  ...Object.keys(peerDependencies || {}),
];

// Creating regexes of the packages to make sure subpaths of the
// packages are also treated as external
export const packageRegexes = externalPackages.map(
  packageName => new RegExp(`^${packageName}(/.*)?`)
);

export default defineConfig(({mode}) => ({
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
    eslint({
      build: true,
      emitErrorAsWarning: mode === 'development',
    }),
    dts({tsconfigPath: './tsconfig.prod.json'}),
  ],
  resolve: {
    alias: {
      '@/components': resolve(_OF_INTERNAL_dirname, 'src/components'),
      '@/registry': resolve(_OF_INTERNAL_dirname, 'src/registry'),
      '@/scss': resolve(_OF_INTERNAL_dirname, 'src/scss'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {quietDeps: true},
    },
  },
  build: {
    lib: {
      entry: resolve(_OF_INTERNAL_dirname, 'src/index.ts'),
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
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.d.ts',
        'src/**/*.stories.{ts,tsx}',
        'src/reference/utils.tsx',
        'src/registry/file/test-utils.ts',
        'src/tests/**/*.{ts,tsx}',
        ...coverageConfigDefaults.exclude,
      ],
      reporter: ['text', 'cobertura', 'html'],
    },
  },
}));
