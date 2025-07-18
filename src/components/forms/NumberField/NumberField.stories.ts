import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from 'storybook/test';

import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import NumberField from './NumberField';

export default {
  title: 'Internal API  / Forms / NumberField',
  component: NumberField,
  decorators: [withFormik],
  parameters: {
    formik: {
      initialValues: {
        number: null,
      },
    },
  },
} satisfies Meta<typeof NumberField>;

type Story = StoryObj<typeof NumberField>;

export const Default: Story = {
  args: {
    name: 'number',
    label: 'Number',
    description: 'This is a custom description for the number field',
    isReadonly: false,
    isRequired: false,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Number');

    // Assert that clicking on the label focuses the input
    const label = canvas.getByText('Number');
    await userEvent.click(label);
    await expect(canvas.getByRole('textbox')).toHaveFocus();

    // Assert that you are not able to type letters
    await userEvent.type(input, 'foo');
    await expect(input).toHaveDisplayValue('');
  },
};

export const Readonly: Story = {
  args: {
    name: 'number',
    label: 'Number',
    description: 'This is a custom description for the number field',
    isReadonly: true,
  },
  parameters: {
    formik: {
      initialValues: {
        number: 10.5,
      },
    },
  },
};

export const LocalisedWithDecimals: Story = {
  args: {
    name: 'number',
    label: 'Number',
    description: 'This is a decimal number formatted using the Dutch locale',
    isReadonly: false,
    isRequired: true,
  },
  parameters: {
    formik: {
      initialValues: {
        number: 1.5,
      },
    },
  },
  globals: {
    locale: 'nl',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Number');

    // Assert that you're able to provide a decimal number
    await expect(input).toHaveDisplayValue('1,5');

    // Assert that you're able to provide a decimal number with comma
    await userEvent.clear(input);
    await userEvent.type(input, '2,3');
    await expect(input).toHaveDisplayValue('2,3');
  },
};

export const LocalisedWithThousandSeparator: Story = {
  args: {
    name: 'number',
    label: 'Number',
    description: 'This is a custom description for the number field',
    isReadonly: false,
    isRequired: true,
    useThousandSeparator: true,
  },
  globals: {
    locale: 'nl',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Number');

    // Assert that you're able to provide a large number, formatted with a Dutch thousand separator
    await userEvent.clear(input);
    await userEvent.type(input, '10000');
    await expect(input).toHaveDisplayValue('10.000');
  },
};

export const DecimalLimit: Story = {
  args: {
    name: 'number',
    label: 'Number',
    description: 'This is a custom description for the number field',
    decimalLimit: 3,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Number');

    await userEvent.clear(input);
    await userEvent.type(input, '10.12345');
    await expect(input).toHaveDisplayValue('10.123');
  },
};

export const NegativeValueNotAllowed: Story = {
  args: {
    name: 'number',
    label: 'Number',
    allowNegative: false,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Number');

    // Assert negative input not possible
    await userEvent.clear(input);
    await userEvent.type(input, '-10');
    await expect(input).toHaveDisplayValue('10');
  },
};

export const NegativeValueAllowed: Story = {
  args: {
    name: 'number',
    label: 'Number',
    allowNegative: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = canvas.getByLabelText('Number');

    // Assert negative input allowed
    await userEvent.clear(input);
    await userEvent.type(input, '-10');
    await expect(input).toHaveDisplayValue('-10');
  },
};

export const WithPrefixAndSuffix: Story = {
  args: {
    name: 'number',
    label: 'Number',
    prefix: 'CO<sub>2</sub>',
    suffix: 'm<sup>2</sup>',
  },
  parameters: {
    formik: {
      initialValues: {
        number: 123,
      },
    },
  },
};

export const ValidationError: Story = {
  parameters: {
    formik: {
      initialValues: {
        number: 42,
      },
      initialErrors: {
        number: 'invalid',
      },
      initialTouched: {
        number: true,
      },
    },
  },
  args: {
    name: 'number',
    label: 'Number',
    description: 'Description above the errors',
    isReadonly: false,
    isRequired: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('invalid')).toBeVisible();
  },
};

export const NoAsterisks: Story = {
  decorators: [withFormSettingsProvider],
  parameters: {
    formSettings: {
      requiredFieldsWithAsterisk: false,
    },
  },
  args: {
    name: 'number',
    label: 'Required without asterisks',
    isRequired: true,
  },
};
