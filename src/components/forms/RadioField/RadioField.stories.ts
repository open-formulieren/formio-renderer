import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';
import {z} from 'zod';

import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import RadioField from './RadioField';

export default {
  title: 'Internal API / Forms / RadioField',
  component: RadioField,
  decorators: [withFormik],
  args: {
    name: 'test',
    label: 'Radio field',
    description: 'A field description',
    isDisabled: false,
    isRequired: false,
    options: [
      {value: 'sherlock', label: 'Sherlock'},
      {value: 'watson', label: 'Watson'},
      {value: 'ziggy', label: 'Ziggy'},
    ],
  },
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof RadioField>;

type Story = StoryObj<typeof RadioField>;

export const Default: Story = {
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');
    await expect(radios).toHaveLength(3);

    await expect(canvas.getByText('Watson')).toBeVisible();
    await expect(canvas.getByText('A field description')).toBeVisible();

    await step('Select value', async () => {
      await userEvent.click(canvas.getByText('Ziggy'));
      await expect(radios[2]).toBeChecked();
    });
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
    name: 'radioInput',
    label: 'Radio',
    description: 'Description above the errors',
  },
  parameters: {
    formik: {
      initialValues: {
        radioInput: 'some text',
      },
      initialErrors: {
        radioInput: 'invalid',
      },
      initialTouched: {
        radioInput: true,
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

    const fieldset = canvas.getByRole('radiogroup', {name: /^Radio/});
    expect(fieldset).toHaveAccessibleDescription('Description above the errors');

    const inputs = canvas.getAllByRole('radio');
    for (const input of inputs) {
      expect(input).toHaveAccessibleDescription('invalid');
    }
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
        validateOnBlur: '',
      },
      zodSchema: z.object({
        validateOnBlur: z.any().refine(() => false, {message: 'Always invalid'}),
      }),
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const radioGroup = canvas.getByRole('radiogroup');

    const input = await canvas.findByLabelText('Ziggy');
    expect(radioGroup).not.toHaveAttribute('aria-invalid');

    await userEvent.click(input);
    expect(input).toHaveFocus();
    expect(radioGroup).not.toHaveAttribute('aria-invalid');

    input.blur();
    expect(await canvas.findByText('Always invalid')).toBeVisible();
    expect(radioGroup).toHaveAttribute('aria-invalid', 'true');
  },
};

// don't display validation errors if there's still focus on a radio input
export const NoErrorWhileFocus: Story = {
  args: {
    name: 'radio',
    label: 'No error displayed while keyboard navigation happens',
  },
  parameters: {
    formik: {
      initialValues: {
        radio: '',
      },
      zodSchema: z.object({
        radio: z.any().refine(() => false, {message: 'Always invalid'}),
      }),
    },
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const firstRadio = await canvas.findByLabelText('Sherlock');
    firstRadio.focus();
    await userEvent.keyboard('{ArrowDown}');

    const secondRadio = canvas.getByLabelText('Watson');
    expect(secondRadio).toBeChecked();
    expect(secondRadio).toHaveFocus();
  },
};
