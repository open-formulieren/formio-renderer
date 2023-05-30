import {TextField} from '@components';
import {RenderComponent} from '@lib/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import React from 'react';

import {FormikDecorator} from '../../../tests/utils/decorators';

const meta: Meta<typeof TextField> = {
  title: 'Components / Formio / Textfield',
  component: TextField,
  decorators: [],
  parameters: {},
};
export default meta;

export const textfield: ComponentStory<typeof RenderComponent> = args => (
  <RenderComponent {...args} />
);
textfield.args = {
  component: {
    description: 'Enter your first name',
    id: 'id',
    inputMask: '',
    key: 'firstName',
    label: 'first name',
    mask: '',
    showCharCount: true,
    type: 'textfield',
  },
};
textfield.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = canvas.getByLabelText('first name');
  expect(await canvas.findByText('Enter your first name')).toBeVisible();
  expect(canvas.queryByText('0 characters')).toBeNull();
  await userEvent.type(input, 'The quick brown fox jumps over the lazy dog.', {delay: 10});
  expect(await canvas.findByText('44 characters')).toBeVisible();
};
textfield.decorators = [FormikDecorator];
