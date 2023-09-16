import {expect} from '@storybook/jest';
import {Meta, StoryObj} from '@storybook/react';
import {userEvent, within} from '@storybook/testing-library';

import {withConfig, withFormik} from '@/sb-decorators';

import TextField from './TextField';

export default {
  title: 'Forms / Fields / TextField',
  component: TextField,
  decorators: [withFormik],
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
  args: {
    name: 'test',
    label: 'test',
    description: 'This is a custom description',
    disabled: false,
    isRequired: true,
  },
} satisfies Meta<typeof TextField>;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole('textbox')).toBeVisible();
    await expect(canvas.getByText('test')).toBeVisible();
    await expect(canvas.getByText('This is a custom description')).toBeVisible();

    // Check if clicking on the label focuses the input
    const label = canvas.getByText('test');
    await userEvent.click(label);
    await expect(canvas.getByRole('textbox')).toHaveFocus();
  },
};

export const ValidationError: Story = {
  name: 'Validation error',
  parameters: {
    formik: {
      initialValues: {
        textinput: 'some text',
      },
      initialErrors: {
        textinput: 'invalid',
      },
      initialTouched: {
        textinput: true,
      },
    },
  },
  args: {
    name: 'textinput',
    label: 'Text field',
    description: 'Description above the errors',
    disabled: false,
    isRequired: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('invalid')).toBeVisible();
  },
};

export const NoAsterisks: Story = {
  name: 'No asterisk for required',
  decorators: [withConfig],
  parameters: {
    config: {
      asteriskForRequired: false,
    },
  },
  args: {
    name: 'test',
    label: 'Default required',
    isRequired: true,
  },
};
