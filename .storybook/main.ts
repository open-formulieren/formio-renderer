import type {StorybookConfig} from '@storybook/react-webpack5';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const config: StorybookConfig = {
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  // stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  core: {
    disableTelemetry: true,
  },
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-react-intl',
  ],
  docs: {
    autodocs: 'tag',
  },
  webpackFinal: async config => {
    if (!config.resolve) {
      config.resolve = {};
    }
    config.resolve.plugins = [new TsconfigPathsPlugin()];
    return config;
  },
};

export default config;
