import type {StorybookConfig} from '@storybook/react-vite';

const config: StorybookConfig = {
  core: {
    disableTelemetry: true,
    disableWhatsNewNotifications: true,
  },
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|ts|tsx)'],
  staticDirs: ['../public'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    'storybook-react-intl',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  features: {viewportStoryGlobals: true},
  docs: {},
  typescript: {
    reactDocgen: 'react-docgen-typescript',
  },
};

export default config;
