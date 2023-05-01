import {Form} from '@formio/react';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import React from 'react';

import {delay} from '../utils/delay';

const meta: Meta<typeof Form> = {
  title: 'Tests / Validation / Formio',
  component: Form,
  decorators: [],
  parameters: {},
};
export default meta;

export const formioTextfieldWithMaxLengthValidation: ComponentStory<typeof Form> = args => (
  <Form {...args} />
);
formioTextfieldWithMaxLengthValidation.args = {
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'firstName',
        label: 'first name',
        validate: {
          maxLength: 10,
        },
      },
    ],
  },
};
formioTextfieldWithMaxLengthValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await delay();
  await userEvent.type(input, 'The quick brown fox jumps over the lazy dog', {delay: 10});
  await delay(300);
  expect(canvas.queryByText('first name must have no more than 10 characters.')).toBeTruthy();
};

export const formioTextfieldWithMinLengthValidation: ComponentStory<typeof Form> = args => (
  <Form {...args} />
);
formioTextfieldWithMinLengthValidation.args = {
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
formioTextfieldWithMinLengthValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await delay();
  await userEvent.type(input, 'The quick', {delay: 10});
  await delay(300);
  expect(canvas.queryByText('first name must have at least 10 characters.')).toBeTruthy();
};

export const formioTextfieldWithPatternValidation: ComponentStory<typeof Form> = args => (
  <Form {...args} />
);
formioTextfieldWithPatternValidation.args = {
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
formioTextfieldWithPatternValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('Postcode');
  await delay();
  await userEvent.type(input, '123 AB', {delay: 10});
  await delay(300);
  expect(
    canvas.queryByText('Postcode does not match the pattern ^\\d{4}\\s?[a-zA-Z]{2}$')
  ).toBeTruthy();
};

export const formioTextfieldWithRequiredValidation: ComponentStory<typeof Form> = args => (
  <Form {...args} />
);
formioTextfieldWithRequiredValidation.args = {
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
formioTextfieldWithRequiredValidation.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await delay();
  await userEvent.type(input, 'John', {delay: 10});
  await userEvent.clear(input);
  await delay(300);
  expect(canvas.queryByText('first name is required')).toBeTruthy();
};
