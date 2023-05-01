import {FORMIO_EXAMPLE} from '@fixtures';
import {Form} from '@formio/react';
import {DEFAULT_RENDER_CONFIGURATION, RenderForm} from '@lib/renderer/renderer';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';
import React from 'react';

const meta: Meta<typeof Form> = {
  title: 'Tests / Form / RenderForm',
  component: RenderForm,
  decorators: [],
  parameters: {},
};
export default meta;

export const renderFormRendersTextfield: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
renderFormRendersTextfield.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: FORMIO_EXAMPLE,
  },
};
renderFormRendersTextfield.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await canvas.findByLabelText('first name');
  await canvas.findByLabelText(FORMIO_EXAMPLE[1].label);
};

export const renderFormRendersActions: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
renderFormRendersActions.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [
      {
        type: 'button',
        action: 'submit',
        label: 'Submit',
        theme: 'primary',
      },
    ],
  },
};
renderFormRendersActions.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await canvas.findByText('Submit');
};

export const renderFormRendersChildrenAsActions: ComponentStory<typeof RenderForm> = args => (
  <RenderForm {...args} />
);
renderFormRendersChildrenAsActions.args = {
  configuration: DEFAULT_RENDER_CONFIGURATION,
  form: {
    display: 'form',
    components: [],
  },
  children: <button type="submit">Submit</button>,
};
renderFormRendersChildrenAsActions.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await canvas.findByText('Submit');
};
