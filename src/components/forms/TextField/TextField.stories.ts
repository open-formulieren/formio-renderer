import {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from '@storybook/test';

import {withFormik, withRenderSettingsProvider} from '@/sb-decorators';

import TextField from './TextField';

export default {
  title: 'Internal API / Forms / TextField',
  component: TextField,
  decorators: [withFormik],
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof TextField>;

type Story = StoryObj<typeof TextField>;

export const Default: Story = {
  args: {
    name: 'test',
    label: 'test',
    description: 'This is a custom description',
    isDisabled: false,
    isRequired: true,
  },
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
    isDisabled: false,
    isRequired: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('invalid')).toBeVisible();
  },
};

export const NoAsterisks = {
  name: 'No asterisk for required',
  decorators: [withRenderSettingsProvider],
  parameters: {
    renderSettings: {
      requiredFieldsWithAsterisk: false,
    },
  },
  args: {
    name: 'test',
    label: 'Default required',
    isRequired: true,
  },
};
