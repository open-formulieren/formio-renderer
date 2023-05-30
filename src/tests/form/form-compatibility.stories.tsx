import {FORMIO_EXAMPLE} from '@fixtures';
import {RenderForm} from '@lib/renderer';
import {expect} from '@storybook/jest';
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
    expect(await canvas.findByLabelText(FORMIO_EXAMPLE[0].label)).toBeVisible();
    expect(await canvas.findByLabelText(FORMIO_EXAMPLE[1].label)).toBeVisible();
  }
);
