import {Description} from '@components';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';

const meta: Meta<typeof Description> = {
  title: 'Components / Utils / Description',
  component: Description,
  decorators: [],
  parameters: {},
};
export default meta;

export const description: ComponentStory<typeof Description> = args => <Description {...args} />;
description.args = {
  description: 'The quick brown fox jumps over the lazy dog.',
};
description.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(await canvas.findByText('The quick brown fox jumps over the lazy dog.')).toBeVisible();
};
