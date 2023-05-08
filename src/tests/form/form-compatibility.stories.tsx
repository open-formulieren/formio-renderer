import {FORMIO_EXAMPLE} from '@fixtures';
import {RenderForm} from '@lib/renderer';
import type {Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';

import {compatibilityStoriesFactory} from '../utils/compatibility-stories-factory';

const meta: Meta<typeof RenderForm> = {
  title: 'Tests / Compatibility / Form',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

export const [FormioRendersTextfield, RenderFormRendersTextField] = compatibilityStoriesFactory(
  {
    form: {
      display: 'form',
      components: FORMIO_EXAMPLE,
    },
  },
  async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await canvas.findByLabelText(FORMIO_EXAMPLE[0].label);
    await canvas.findByLabelText(FORMIO_EXAMPLE[1].label);
  }
);
