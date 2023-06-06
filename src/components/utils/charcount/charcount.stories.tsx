import {CharCount} from '@components';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';

const meta: Meta<typeof CharCount> = {
  title: 'Components / Utils / Charcount',
  component: CharCount,
  decorators: [],
  parameters: {},
};
export default meta;

export const charcount: ComponentStory<typeof CharCount> = args => <CharCount {...args} />;
charcount.args = {
  value: 'foo',
};
charcount.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(await canvas.findByText('3 characters')).toBeVisible();
};
