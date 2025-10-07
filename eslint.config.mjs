import {ignoreBuildArtifacts} from '@maykinmedia/eslint-config';
import recommended from '@maykinmedia/eslint-config/recommended';
import {defineConfig} from 'eslint/config';
import globals from 'globals';

const config = defineConfig([
  ignoreBuildArtifacts(['dist', 'storybook-static']),
  {
    files: ['**/*.{js,mjs,ts,tsx}'],
  },
  ...recommended,
  {
    name: 'project/overrides',
    rules: {
      // covered by Typescript
      'react/prop-types': 'off',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          fixStyle: 'separate-type-imports',
          prefer: 'type-imports',
        },
      ],
    },
  },
  // Unit tests
  {
    files: ['**/*.spec.{ts,tsx}', 'vitest.setup.ts'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.vitest,
      },
    },
    rules: {
      'react/display-name': 'off',
    },
  },
]);

export default config;
