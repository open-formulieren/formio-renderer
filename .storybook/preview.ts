import '@fortawesome/fontawesome-free/css/fontawesome.css';
import '@fortawesome/fontawesome-free/css/solid.css';
import '@open-formulieren/design-tokens/dist/index.css';
import type {Preview} from '@storybook/react-vite';
import '@utrecht/components/dist/document/css/index.css';

import {utrechtDocumentDecorator, withGeolocationMocking} from './decorators';
import {reactIntl} from './reactIntl';

const preview: Preview = {
  decorators: [utrechtDocumentDecorator, withGeolocationMocking],
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
    geolocation: {
      permission: 'granted',
      latitude: 52.3857386,
      longitude: 4.8417475,
      updatePermission: () => {}, // Is set by withGeolocationMocking
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
