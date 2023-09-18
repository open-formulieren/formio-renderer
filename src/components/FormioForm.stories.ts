import {expect} from '@storybook/jest';
import {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';

import FormioForm from './FormioForm';

export default {
  title: 'Renderer / FormioForm',
  component: FormioForm,
  tags: ['autodocs'],
  parameters: {},
  args: {
    form: {
      components: [
        {
          type: 'textfield',
          key: 'aTextField',
          id: 'aTextField',
          label: 'A text field',
        },
      ],
    },
    submission: {data: {}},
  },
} satisfies Meta<typeof FormioForm>;

type Story = StoryObj<typeof FormioForm>;

export const Default: Story = {};
