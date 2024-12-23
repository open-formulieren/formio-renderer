import type {StorybookConfig} from '@storybook/react-webpack5';
import TsconfigPathsPlugin from 'tsconfig-paths-webpack-plugin';

const config: StorybookConfig = {
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-react-intl',
    '@storybook/addon-webpack5-compiler-babel',
  ],
  docs: {},
  webpackFinal: async config => {
    if (!config.resolve) {
      config.resolve = {};
    }
    config.resolve.plugins = [new TsconfigPathsPlugin()];
    return config;
  },
};

export default config;
