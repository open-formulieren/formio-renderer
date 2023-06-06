import {Label} from '@components';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';

const meta: Meta<typeof Label> = {
  title: 'Components / Utils / Label',
  component: Label,
  decorators: [],
  parameters: {},
};
export default meta;

export const label: ComponentStory<typeof Label> = args => <Label {...args} />;
label.args = {
  label: 'The quick brown fox jumps over the lazy dog.',
};
label.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(await canvas.findByText('The quick brown fox jumps over the lazy dog.')).toBeVisible();
};