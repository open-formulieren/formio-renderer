import {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from '@storybook/test';
import {z} from 'zod';

import {withFormik, withRenderSettingsProvider} from '@/sb-decorators';

import Textarea from './Textarea';

export default {
  title: 'Internal API / Forms / Textarea',
  component: Textarea,
  decorators: [withFormik],
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof Textarea>;

type Story = StoryObj<typeof Textarea>;

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
    expect(canvas.getByRole('textbox')).toBeVisible();
    expect(canvas.getByText('test')).toBeVisible();
    expect(canvas.getByText('This is a custom description')).toBeVisible();
    // Check if clicking on the label focuses the input
    const label = canvas.getByText('test');
    await userEvent.click(label);
    expect(canvas.getByRole('textbox')).toHaveFocus();
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
    expect(input).toHaveAccessibleDescription('invalid');
  },
};

export const NoAsterisks: Story = {
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

    await userEvent.type(input, 'foo');
    expect(input).toHaveFocus();
    expect(input).not.toHaveAttribute('aria-invalid');

    input.blur();
    expect(await canvas.findByText('Always invalid')).toBeVisible();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const AutoExpand: Story = {
  args: {
    name: 'AutoExpand',
    label: 'Auto expand',
    autoExpand: true,
    rows: 3,
  },
  parameters: {
    formik: {
      initialValues: {
        AutoExpand: '',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText('Auto expand');

    const initialHeight = parseFloat(getComputedStyle(input).height);

    await userEvent.type(input, 'foo');
    expect(input).toHaveFocus();
    input.blur();

    // Expect that the textarea is the same height as before.
    // The textarea should not get smaller than the minimum height requirement of `rows`.
    expect(parseFloat(getComputedStyle(input).height)).toBe(initialHeight);

    // Add multiple lines of text
    await userEvent.type(input, '\n' + 'bar\n' + 'foobar\n' + 'barfooz');
    expect(input).toHaveFocus();
    input.blur();

    // Expect that the textarea grew to fit all content
    expect(parseFloat(getComputedStyle(input).height)).toBeGreaterThan(initialHeight);

    await userEvent.clear(input);
    await userEvent.type(input, 'foo');
    expect(input).toHaveFocus();
    input.blur();

    // Expect that the textarea shrank back to its initial height
    expect(parseFloat(getComputedStyle(input).height)).toBe(initialHeight);
  },
};
