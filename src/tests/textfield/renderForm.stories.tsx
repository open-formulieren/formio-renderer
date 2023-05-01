import {Form} from '@formio/react';
import {DEFAULT_RENDER_CONFIGURATION, RenderForm} from '@lib/renderer/renderer';
import {expect} from '@storybook/jest';
import type {ComponentStory, Meta} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';
import React from 'react';

const meta: Meta<typeof Form> = {
  title: 'Tests / Textfield / RenderForm',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

export const TextfieldHasNoCharcountByDefault: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
TextfieldHasNoCharcountByDefault.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [{type: 'textfield', key: 'firstName', label: 'first name'}],
  },
};
TextfieldHasNoCharcountByDefault.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await userEvent.type(input, 'John', {delay: 10});
  expect(canvas.queryByText('4 characters')).toBeNull();
};
export const TextfieldWithCharcount: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
TextfieldWithCharcount.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [{type: 'textfield', key: 'firstName', label: 'first name', showCharCount: true}],
  },
};
TextfieldWithCharcount.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await userEvent.type(input, 'John', {delay: 10});
  expect(canvas.queryByText('4 characters')).toBeTruthy();
};

export const TextfieldWithoutCharcount: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
TextfieldWithoutCharcount.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [{type: 'textfield', key: 'firstName', label: 'first name', showCharCount: false}],
  },
};
TextfieldWithoutCharcount.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  const input = await canvas.findByLabelText('first name');
  await userEvent.type(input, 'John', {delay: 10});
  expect(canvas.queryByText('4 characters')).toBeFalsy();
};

export const TextfieldWithDescription: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
TextfieldWithDescription.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
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
TextfieldWithDescription.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(canvas.queryByText('Enter your first name')).toBeTruthy();
};

export const descriptionDoesNotSupportHTML: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
descriptionDoesNotSupportHTML.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
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
descriptionDoesNotSupportHTML.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  expect(canvas.queryByText('Enter your <b>first</b> name')).toBeTruthy();
  expect(canvas.queryByText('first')).toBeFalsy();
};
