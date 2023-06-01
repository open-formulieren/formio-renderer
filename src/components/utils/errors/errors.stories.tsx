import {Errors} from '@components';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';

const meta: Meta<typeof Errors> = {
  title: 'Components / Utils / Errors',
  component: Errors,
  decorators: [],
  parameters: {},
};
export default meta;

export const errors: ComponentStory<typeof Errors> = args => <Errors {...args} />;
errors.args = {
  errors: ['Postcode is required', 'Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$'],
};
errors.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(await canvas.findByText('Postcode is required')).toBeVisible();
  expect(
    await canvas.findByText('Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$')
  ).toBeVisible();
};
