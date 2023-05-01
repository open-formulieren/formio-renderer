import {FORMIO_EXAMPLE} from '@fixtures';
import {Form} from '@formio/react';
import type {ComponentStory, Meta} from '@storybook/react';
import {within} from '@storybook/testing-library';
import React from 'react';

const meta: Meta<typeof Form> = {
  title: 'Tests / Form / Formio',
  component: Form,
  decorators: [],
  parameters: {},
};
export default meta;

export const formioFormRendersTextfield: ComponentStory<typeof Form> = args => <Form {...args} />;
formioFormRendersTextfield.args = {
  form: {
    display: 'form',
    components: FORMIO_EXAMPLE,
  },
};
formioFormRendersTextfield.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await canvas.findByLabelText(FORMIO_EXAMPLE[0].label);
  await canvas.findByLabelText(FORMIO_EXAMPLE[1].label);
};

export const formioFormRendersActions: ComponentStory<typeof Form> = args => <Form {...args} />;
formioFormRendersActions.args = {
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
formioFormRendersActions.play = async ({canvasElement}) => {
  const canvas = within(canvasElement);
  await canvas.findByText('Submit');
};
