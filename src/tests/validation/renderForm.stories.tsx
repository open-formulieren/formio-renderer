import {Form} from '@formio/react';
import {DEFAULT_RENDER_CONFIGURATION, RenderForm} from '@lib/renderer/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import React from 'react';

import {delay} from '../utils/delay';

const meta: Meta<typeof Form> = {
  title: 'Tests / Validation / RenderForm',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

export const TextfieldWithMaxLengthValidation: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
TextfieldWithMaxLengthValidation.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'firstName',
        label: 'first name',
        description: 'Input has maxlength attribute set preventing excessive input',
        validate: {
          maxLength: 10,
        },
      },
    ],
  },
};
TextfieldWithMaxLengthValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input: HTMLInputElement = await canvas.findByLabelText('first name');
  await userEvent.type(input, 'The quick brown fox jumps over the lazy dog', {delay: 10});
  expect(input.value).toBe('The quick '); // Max length via attribute.
};

export const TextfieldWithMinLengthValidation: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
TextfieldWithMinLengthValidation.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'firstName',
        label: 'first name',
        validate: {
          minLength: 10,
        },
      },
    ],
  },
};
TextfieldWithMinLengthValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input: HTMLInputElement = await canvas.findByLabelText('first name');
  await userEvent.type(input, 'The quick', {delay: 10});
  expect(canvas.queryByText('first name must have at least 10 characters.')).toBeTruthy();
};

export const TextfieldWithPatternValidation: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
TextfieldWithPatternValidation.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'postcode',
        label: 'Postcode',
        validate: {
          pattern: '^\\d{4}\\s?[a-zA-Z]{2}$',
        },
      },
    ],
  },
};
TextfieldWithPatternValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('Postcode');
  await userEvent.type(input, '123 AB', {delay: 10});
  expect(
    canvas.queryByText('Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$')
  ).toBeTruthy();
};

export const TextfieldWithRequiredValidation: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
TextfieldWithRequiredValidation.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'firstName',
        label: 'first name',
        validate: {
          required: true,
        },
      },
    ],
  },
};
TextfieldWithRequiredValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await userEvent.type(input, 'John', {delay: 10});
  await userEvent.clear(input);
  await delay();
  expect(canvas.queryByText('first name is required')).toBeTruthy();
};
