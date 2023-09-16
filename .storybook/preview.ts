import '@open-formulieren/design-tokens/dist/index.css';
import {Preview} from '@storybook/react';
import '@utrecht/component-library-css';

import {reactIntl} from './reactIntl';

const preview: Preview = {
  globals: {
    locale: reactIntl.defaultLocale,
    locales: {
      en: 'English',
      nl: 'Nederlands',
    },
  },
  parameters: {
    reactIntl,
    actions: {argTypesRegex: '^on[A-Z].*'},
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
  },
};

export default preview;
