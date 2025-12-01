import type {Meta, StoryObj} from '@storybook/react-vite';
import selectEvent from 'react-select-event';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {z} from 'zod';

import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import Select from './Select';

export default {
  title: 'Internal API / Forms / Select',
  component: Select,
  decorators: [withFormik],
  args: {
    name: 'test',
    label: 'test',
    options: [
      {value: 'option-1', label: 'Option 1'},
      {value: 'option-2', label: 'Option 2'},
    ],
  },
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof Select>;

type Story = StoryObj<typeof Select>;

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
    expect(canvas.getByRole('combobox')).toBeVisible();
    expect(canvas.getByText('test')).toBeVisible();
    expect(canvas.getByText('This is a custom description')).toBeVisible();
    // Check if clicking on the label focuses the input
    const label = canvas.getByText('test');
    await userEvent.click(label);
    expect(canvas.getByRole('combobox')).toHaveFocus();
  },
};

export const SingleSelectOption: Story = {
  args: {
    name: 'test',
    label: 'test',
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // eslint-disable-next-line import/no-named-as-default-member
    await selectEvent.select(canvas.getByLabelText('test'), 'Option 1');
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(canvas.getByText('Option 1')).toBeVisible();
  },
};

export const MultipleSelectOptions: Story = {
  args: {
    name: 'test',
    label: 'test',
    isMulti: true,
  },
  parameters: {
    formik: {
      initialValues: {
        test: [],
      },
    },
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // eslint-disable-next-line import/no-named-as-default-member
    await selectEvent.select(canvas.getByLabelText('test'), 'Option 1');
    // eslint-disable-next-line import/no-named-as-default-member
    await selectEvent.select(canvas.getByLabelText('test'), 'Option 2');
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(canvas.getByText('Option 1')).toBeVisible();
    expect(canvas.getByText('Option 2')).toBeVisible();
  },
};

export const EmptyMultipleSelectOptions: Story = {
  args: {
    name: 'test',
    label: 'test',
    isMulti: true,
  },
  parameters: {
    formik: {
      initialValues: {
        test: [],
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    name: 'test',
    label: 'test',
    description: 'This is a custom description',
    isDisabled: false,
    isRequired: true,
    tooltip: 'Example short tooltip.',
  },
};

export const ValidationError: Story = {
  name: 'Validation error',
  parameters: {
    formik: {
      initialValues: {
        select: '',
      },
      initialErrors: {
        select: 'invalid',
      },
      initialTouched: {
        select: true,
      },
    },
  },
  args: {
    name: 'select',
    label: 'Select',
    description: 'Description above the errors',
    isDisabled: false,
    isRequired: true,
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

  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const input = canvas.getByLabelText(args.label as string);
    // the tooltip gets announced by itself and we do not expect it to be in the input
    // description too, as otherwise screenreaders encounter it twice.
    expect(input).toHaveAccessibleDescription('Select... invalid');
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
    const input = await canvas.findByLabelText('Validate on blur');
    expect(input).not.toHaveAttribute('aria-invalid');

    await userEvent.click(input);
    await userEvent.click(await canvas.findByRole('option', {name: 'Option 2'}));
    expect(input).toHaveFocus();
    expect(input).not.toHaveAttribute('aria-invalid');

    input.blur();
    expect(await canvas.findByText('Always invalid')).toBeVisible();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const AutoSelectOnlyOption: Story = {
  args: {
    options: [{value: 'onlyOption', label: 'Only available option'}],
    autoSelectOnlyOption: true,
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Only available option')).toBeVisible();
  },
};
