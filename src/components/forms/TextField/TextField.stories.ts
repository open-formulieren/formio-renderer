import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {z} from 'zod';

import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

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
    isReadOnly: false,
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
    isReadOnly: false,
    isRequired: true,
    tooltip: 'Example short tooltip.',
  },
};

export const ReadOnly: Story = {
  args: {
    name: 'test',
    label: 'test',
    description: 'This is a custom description',
    isReadOnly: true,
    isRequired: true,
  },
  parameters: {
    formik: {
      initialValues: {
        test: 'Value can be selected and copied',
      },
    },
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
    isReadOnly: false,
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

    await userEvent.type(input, 'foo');
    expect(input).toHaveFocus();
    expect(input).not.toHaveAttribute('aria-invalid');

    input.blur();
    expect(await canvas.findByText('Always invalid')).toBeVisible();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  },
};

export const ShowCharCountWithoutLimit: Story = {
  name: 'Show character count without a character limit',
  args: {
    name: 'showCharCount',
    label: 'Show char count',
    showCharCount: true,
    maxLength: undefined,
  },
  parameters: {
    formik: {
      initialValues: {
        showCharCount: '',
      },
    },
  },
  globals: {
    locale: 'nl',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText('Show char count');

    // The character count should not be shown with empty value
    expect(canvas.queryByText('0 karakters.')).not.toBeInTheDocument();

    await userEvent.type(input, 'I am an example text.');

    // Expect the 'X characters' text to be shown, with the right amount of used
    // characters.
    const charactersUsedMessage = await canvas.findByText('21 karakters.');
    expect(charactersUsedMessage).toBeVisible();

    // Expect that the character count is also accessible by screen-readers.
    await waitFor(() => {
      expect(input).toHaveAccessibleDescription('21 karakters.');
    });
  },
};

export const ShowCharCountWithLimit: Story = {
  name: 'Show character count with a character limit',
  args: {
    name: 'showCharCount',
    label: 'Show char count',
    showCharCount: true,
    maxLength: 50,
  },
  parameters: {
    formik: {
      initialValues: {
        showCharCount: '',
      },
      zodSchema: z.object({
        showCharCount: z.string().max(50),
      }),
    },
  },
  globals: {
    locale: 'nl',
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const input = await canvas.findByLabelText('Show char count');

    // The character count should not be shown with empty value
    expect(canvas.queryByText('0 karakters.')).not.toBeInTheDocument();

    // The character limit should not be set to the html component.
    // Conform the current setup, we limit the amount of characters via custom validation
    expect(input).not.toHaveAttribute('maxlength', '50');

    await step('Character count is shown after typing content', async () => {
      await userEvent.type(input, 'I am an example text.');

      // Expect the 'characters remaining' text to be shown, with the right amount of
      // remaining characters.
      expect(await canvas.findByText('Nog 29 karakters over.')).toBeVisible();
      await waitFor(() => {
        expect(input).toHaveAccessibleDescription('Nog 29 karakters over.');
      });
    });

    await step('Character count for 1 character remaining', async () => {
      // Show the correct message when 1 character left.
      await userEvent.type(input, " I'm standing on the edge...");

      expect(await canvas.findByText('Nog 1 karakter over.')).toBeVisible();
      await waitFor(() => {
        expect(input).toHaveAccessibleDescription('Nog 1 karakter over.');
      });
    });

    await step('Character count for 0 characters remaining', async () => {
      await userEvent.type(input, ' ');

      expect(await canvas.findByText('Nog 0 karakters over.')).toBeVisible();
      await waitFor(() => {
        expect(input).toHaveAccessibleDescription('Nog 0 karakters over.');
      });
    });

    await step('Character count beyond characters limit', async () => {
      await userEvent.type(input, 'And I can go beyond it!');

      expect(await canvas.findByText('Nog -23 karakters over.')).toBeVisible();
      await waitFor(() => {
        expect(input).toHaveAccessibleDescription('Nog -23 karakters over.');
      });

      // Trigger the zog validation
      await userEvent.tab();
      expect(await canvas.findByText('String must contain at most 50 character(s)')).toBeVisible();
    });
  },
};
