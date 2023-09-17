import {expect} from '@storybook/jest';
import {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';

import {withFormik} from '@/sb-decorators';

import FormioComponent from './FormioComponent';

export default {
  title: 'Renderer / FormioComponent',
  component: FormioComponent,
  decorators: [withFormik],
  tags: ['autodocs'],
  parameters: {
    formik: {
      initialValues: {
        aTextField: '',
      },
    },
  },
  args: {
    component: {
      type: 'textfield',
      key: 'aTextField',
      id: 'aTextField',
      label: 'A text field',
    },
  },
} satisfies Meta<typeof FormioComponent>;

type Story = StoryObj<typeof FormioComponent>;

export const Default: Story = {};

export const TextField: Story = {
  args: {
    component: {
      type: 'textfield',
      key: 'aTextField',
      id: 'aTextField',
      label: 'A text field',
      description: 'With help text',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const input = canvas.getByLabelText<HTMLInputElement>('A text field');
    expect(input).toBeVisible();
    expect(input).toHaveDisplayValue('');
    expect(input.type).toBe('text');

    await userEvent.type(input, 'Foo');
    expect(input).toHaveDisplayValue('Foo');
  },
};
