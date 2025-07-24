import {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from '@storybook/test';
import {z} from 'zod';

import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import Checkbox from './Checkbox';

export default {
  title: 'Internal API / Forms / Checkbox',
  component: Checkbox,
  decorators: [withFormik],
  args: {
    name: 'test',
    label: 'Checkbox',
    description: 'This is a custom description',
    isDisabled: false,
    isRequired: false,
  },
  parameters: {
    formik: {
      initialValues: {
        test: true,
      },
    },
  },
} satisfies Meta<typeof Checkbox>;

type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const radio = canvas.getByRole('checkbox');
    expect(radio).toBeVisible();
    expect(radio).toBeChecked();
    expect(canvas.getByText('Checkbox')).toBeVisible();
    expect(canvas.getByText('This is a custom description')).toBeVisible();

    // Check if clicking on the label focuses the input
    const label = canvas.getByText('Checkbox');
    await userEvent.click(label);
    expect(canvas.getByRole('checkbox')).toHaveFocus();
    expect(radio).not.toBeChecked();
  },
};

export const WithTooltip: Story = {
  args: {
    isRequired: true,
    tooltip: 'Example short tooltip.',
  },
};

export const ValidationError: Story = {
  name: 'Validation error',
  args: {
    name: 'checkbox',
    label: 'Checkbox',
    description: 'Description above the errors',
  },
  parameters: {
    formik: {
      initialValues: {
        checkbox: 'some text',
      },
      initialErrors: {
        checkbox: 'invalid',
      },
      initialTouched: {
        checkbox: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('invalid')).toBeVisible();
  },
};

export const WithValidationErrorAndTooltip: Story = {
  ...ValidationError,
  args: {
    ...ValidationError.args,
    tooltip: 'Tooltip content.',
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const input = canvas.getByRole('checkbox');
    expect(input).toHaveAccessibleDescription('invalid');
  },
};

export const NoAsterisks: Story = {
  name: 'No asterisk for required',
  decorators: [withFormSettingsProvider],
  parameters: {
    formSettings: {
      requiredFieldsWithAsterisk: false,
    },
  },
  args: {
    name: 'test',
    label: 'Default required',
    isRequired: true,
  },
};

export const ValidateOnBlur: Story = {
  args: {
    name: 'validateOnBlur',
    label: 'Validate on blur',
  },
  parameters: {
    formik: {
      initialValues: {
        validateOnBlur: false,
      },
      zodSchema: z.object({
        validateOnBlur: z.any().refine(() => false, {message: 'Always invalid'}),
      }),
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const checkbox = await canvas.findByLabelText('Validate on blur');
    expect(checkbox).not.toHaveAttribute('aria-invalid');

    // check it
    await userEvent.click(checkbox);
    expect(checkbox).toHaveFocus();
    expect(checkbox).not.toHaveAttribute('aria-invalid');
    expect(checkbox).toBeChecked();

    // uncheck it again
    await userEvent.click(checkbox);
    expect(checkbox).toHaveFocus();
    expect(checkbox).not.toHaveAttribute('aria-invalid');
    expect(checkbox).not.toBeChecked();

    checkbox.blur();
    expect(await canvas.findByText('Always invalid')).toBeVisible();
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).not.toBeChecked();
  },
};
