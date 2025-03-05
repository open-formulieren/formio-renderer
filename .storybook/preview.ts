import '@open-formulieren/design-tokens/dist/index.css';
import {Preview} from '@storybook/react';
import '@utrecht/components/dist/button/css/index.css';
import '@utrecht/components/dist/document/css/index.css';

import {utrechtDocumentDecorator} from './decorators';
import {reactIntl} from './reactIntl';

const preview: Preview = {
  decorators: [utrechtDocumentDecorator],
  parameters: {
    reactIntl,
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Introduction', 'Public API', 'Component registry', 'Internal API'],
      },
    },
  },
  initialGlobals: {
    locale: reactIntl.defaultLocale,
    locales: {
      en: 'English',
      nl: 'Nederlands',
    },
  },
  tags: ['private'],
};

export default preview;
