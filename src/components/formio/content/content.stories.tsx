import {Content} from '@components';
import {RenderComponent} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';

import {FormikDecorator} from '../../../tests/utils/decorators';

const meta: Meta<typeof Content> = {
  title: 'Components / Formio / Content',
  component: Content,
  decorators: [],
  parameters: {},
};
export default meta;

export const content: ComponentStory<typeof RenderComponent> = args => (
  <RenderComponent {...args} />
);
content.args = {
  component: {
    key: 'foo',
    type: 'content',
    html: 'The <b>quick</b> brown fox jumps over the lazy dog.',
  },
};
content.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(await canvas.findByText('quick')).toBeVisible();
};
content.decorators = [FormikDecorator];
