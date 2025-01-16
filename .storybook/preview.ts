import '@open-formulieren/design-tokens/dist/index.css';
import {Preview} from '@storybook/react';
import '@utrecht/components/dist/document/css/index.css';

import {utrechtDocumentDecorator} from './decorators';

const preview: Preview = {
  decorators: [utrechtDocumentDecorator],
  parameters: {
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
  tags: ['private'],
};

export default preview;
