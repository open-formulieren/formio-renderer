import type {StorybookConfig} from '@storybook/react-webpack5';
import CircularDependencyPlugin from 'circular-dependency-plugin';
import path from 'path';
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
    {
      name: '@storybook/addon-styling-webpack',
      options: {
        rules: [
          // Replaces existing CSS rules with given rule
          {
            test: /\.css$/,
            use: ['style-loader', 'css-loader'],
          },
          // Replaces any existing Sass rules with given rules
          {
            test: /\.s[ac]ss$/i,
            use: [
              'style-loader',
              'css-loader',
              {
                loader: 'sass-loader',
                options: {
                  implementation: require.resolve('sass'),
                  sassOptions: {
                    quietDeps: true,
                  },
                },
              },
            ],
          },
        ],
      },
    },
  ],
  docs: {},
  webpackFinal: async config => {
    if (!config.resolve) {
      config.resolve = {};
    }
    config.resolve.plugins = [new TsconfigPathsPlugin()];

    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }
    config.resolve.alias['@/scss'] = path.resolve('src/scss');

    if (!config.plugins) {
      config.plugins = [];
    }
    config.plugins.push(
      new CircularDependencyPlugin({
        failOnError: true,
        exclude: /node_modules/,
      })
    );
    return config;
  },
};

export default config;
