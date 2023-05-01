import {Form} from '@formio/react';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import React from 'react';

import {delay} from '../utils/delay';

const meta: Meta<typeof Form> = {
  title: 'Tests / Textfield / Formio',
  component: Form,
  decorators: [],
  parameters: {},
};
export default meta;

export const formioTextfieldHasNoCharcountByDefault: ComponentStory<typeof Form> = args => (
  <Form {...args} />
);
formioTextfieldHasNoCharcountByDefault.args = {
  form: {
    display: 'form',
    components: [{type: 'textfield', key: 'firstName', label: 'first name'}],
  },
};
formioTextfieldHasNoCharcountByDefault.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await delay();
  await userEvent.type(input, 'John', {delay: 10});
  await delay(300);
  expect(canvas.queryByText('4 characters')).toBeNull();
};

export const formioTextfieldWithCharcount: ComponentStory<typeof Form> = args => <Form {...args} />;
formioTextfieldWithCharcount.args = {
  form: {
    display: 'form',
    components: [{type: 'textfield', key: 'firstName', label: 'first name', showCharCount: true}],
  },
};
formioTextfieldWithCharcount.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await delay();
  await userEvent.type(input, 'John', {delay: 10});
  await delay(300);
  expect(canvas.queryByText('4 characters')).toBeTruthy();
};

export const formioTextfieldWithoutCharcount: ComponentStory<typeof Form> = args => (
  <Form {...args} />
);
formioTextfieldWithoutCharcount.args = {
  form: {
    display: 'form',
    components: [{type: 'textfield', key: 'firstName', label: 'first name', showCharCount: false}],
  },
};
formioTextfieldWithoutCharcount.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await delay();
  await userEvent.type(input, 'John', {delay: 10});
  await delay(300);
  expect(canvas.queryByText('4 characters')).toBeFalsy();
};

export const formioTextfieldWithDescription: ComponentStory<typeof Form> = args => (
  <Form {...args} />
);
formioTextfieldWithDescription.args = {
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'firstName',
        label: 'first name',
        description: 'Enter your first name',
      },
    ],
  },
};
formioTextfieldWithDescription.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await delay(300);
  expect(canvas.queryByText('Enter your first name')).toBeTruthy();
};

export const formioDescriptionSupportsHTML: ComponentStory<typeof Form> = args => (
  <Form {...args} />
);
formioDescriptionSupportsHTML.args = {
  form: {
    display: 'form',
    components: [
      {
        type: 'textfield',
        key: 'firstName',
        label: 'first name',
        description: 'Enter your <b>first</b> name',
      },
    ],
  },
};
formioDescriptionSupportsHTML.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await delay(300);
  expect(canvas.queryByText('Enter your <b>first</b> name')).toBeFalsy();
  expect(canvas.queryByText('first')).toBeTruthy();
};
