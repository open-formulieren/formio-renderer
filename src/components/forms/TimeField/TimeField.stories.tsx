import type {Meta, StoryObj} from '@storybook/react-vite';
import {PrimaryActionButton, SecondaryActionButton} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {expect, fn, userEvent, within} from 'storybook/test';
import {z} from 'zod';

import {withFormik} from '@/sb-decorators';

import TimeField from '../TimeField';

export default {
  title: 'Internal API / Forms / TimeField',
  component: TimeField,
  decorators: [withFormik],
  args: {
    name: 'test',
    label: 'Test time field',
    isRequired: true,
    isDisabled: false,
    description: '',
  },
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof TimeField>;

type Story = StoryObj<typeof TimeField>;

export const Input: Story = {
  args: {
    name: 'test',
    label: 'Test time field',
    description: 'This is a custom description',
    tooltip: 'A short tooltip.',
    isDisabled: false,
    isRequired: true,
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const fieldset = canvas.getByRole('group', {name: /^Test time field/});
    expect(fieldset).toHaveAccessibleDescription('');

    const inputs = canvas.getAllByRole<HTMLInputElement>('textbox');
    expect(inputs).toHaveLength(2);
    await expect(canvas.getByText('Test time field')).toBeVisible();
    await expect(canvas.getByText('Hour')).toBeVisible();
    await expect(canvas.getByText('Minute')).toBeVisible();
    await expect(canvas.getByText('This is a custom description')).toBeVisible();

    const inputsByName = Object.fromEntries(inputs.map(input => [input.name, input]));

    await step('Focus hour', async () => {
      const hourLabel = canvas.getByText('Hour');
      await userEvent.click(hourLabel);
      expect(inputsByName.hour).toHaveFocus();
    });

    await step('Focus minute', async () => {
      const minuteLabel = canvas.getByText('Minute');
      await userEvent.click(minuteLabel);
      expect(inputsByName.minute).toHaveFocus();
    });
  },
};

export const InputSubmit: Story = {
  args: {
    name: 'test',
    label: 'Test time field',
    isDisabled: false,
    isRequired: true,
  },
  decorators: [
    Story => (
      <>
        <Story />
        <PrimaryActionButton type="submit" style={{marginBlockStart: '20px'}}>
          Submit
        </PrimaryActionButton>
      </>
    ),
  ],
  parameters: {
    formik: {
      initialValues: {test: ''},
      onSubmit: fn(),
    },
  },

  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Hour'), '02');
    await userEvent.type(canvas.getByLabelText('Minute'), '30');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({
      test: '02:30:00',
    });
  },
};

export const InputWithInitialValue: Story = {
  args: {},
  parameters: {
    formik: {
      initialValues: {
        test: '02:03:00',
      },
      initialErrors: {
        test: 'A validation error',
      },
      initialTouched: {
        test: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByLabelText('Hour')).toHaveDisplayValue('02');
    expect(canvas.getByLabelText('Minute')).toHaveDisplayValue('03');

    expect(canvas.getByText('A validation error')).toBeVisible();
  },
};

export const InputReflectsExternalUpdates: Story = {
  decorators: [
    (Story, {args: {name}}) => {
      const {setFieldValue} = useFormikContext();
      return (
        <>
          <Story />
          <SecondaryActionButton
            type="button"
            onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              setFieldValue(name, '08:03:00');
            }}
            style={{marginBlockStart: '20px'}}
          >
            Alter value
          </SecondaryActionButton>
        </>
      );
    },
  ],
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await step('Assert initial state', () => {
      expect(canvas.getByLabelText('Hour')).toHaveDisplayValue('');
      expect(canvas.getByLabelText('Minute')).toHaveDisplayValue('');
    });

    await step('Change form field value from external trigger', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Alter value'}));
      expect(canvas.getByLabelText('Hour')).toHaveDisplayValue('08');
      expect(canvas.getByLabelText('Minute')).toHaveDisplayValue('03');
    });

    await step('Do not clear inputs for already invalid date', async () => {
      await userEvent.clear(canvas.getByLabelText('Minute'));
      expect(canvas.getByLabelText('Hour')).toHaveDisplayValue('08');
      expect(canvas.getByLabelText('Minute')).toHaveDisplayValue('');
    });
  },
};

// Invalid input needs to be handled by form validation and not automatically
// reject inputs because of accessibility reasons - non-sighted users otherwise don't
// get feedback that the value was cleared. It's better to provide a clear error message
// that the value is not a valid time.
export const LeavesInvalidInputAlone: Story = {
  args: {
    name: 'test',
    label: 'Test invalid inputs',
    isDisabled: false,
    isRequired: false,
  },
  decorators: [
    Story => (
      <>
        <Story />
        <button type="submit">Submit</button>
      </>
    ),
  ],
  parameters: {
    formik: {
      initialValues: {test: ''},
      onSubmit: fn(),
    },
  },

  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Hour'), '9');
    await userEvent.type(canvas.getByLabelText('Minute'), '55555');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({
      test: '09:55555:00',
    });
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

    const container = canvas.getByRole('group', {name: 'Validate on blur'});
    expect(container).not.toHaveAttribute('aria-invalid');

    const hourInput = canvas.getByLabelText('Hour');
    await userEvent.type(hourInput, '9');
    expect(canvas.queryByText('Always invalid')).not.toBeInTheDocument();
    expect(container).not.toHaveAttribute('aria-invalid');

    const minuteInput = canvas.getByLabelText('Minute');
    await userEvent.type(minuteInput, '100k');
    expect(canvas.queryByText('Always invalid')).not.toBeInTheDocument();
    expect(container).not.toHaveAttribute('aria-invalid');

    minuteInput.blur();
    expect(await canvas.findByText('Always invalid')).toBeVisible();
    expect(container).toHaveAttribute('aria-invalid', 'true');
  },
};

export const InputInvalidHour: Story = {
  args: {
    name: 'test',
    label: 'Test time field',
    isDisabled: false,
    isRequired: true,
  },
  decorators: [
    Story => (
      <>
        <Story />
        <PrimaryActionButton type="submit" style={{marginBlockStart: '20px'}}>
          Submit
        </PrimaryActionButton>
      </>
    ),
  ],
  parameters: {
    formik: {
      initialValues: {test: ''},
      onSubmit: fn(),
    },
  },

  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Hour'), '30');
    await userEvent.type(canvas.getByLabelText('Minute'), '30');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({
      test: '30:30:00',
    });
  },
};

export const InputInvalidMinute: Story = {
  args: {
    name: 'test',
    label: 'Test time field',
    isDisabled: false,
    isRequired: true,
  },
  decorators: [
    Story => (
      <>
        <Story />
        <PrimaryActionButton type="submit" style={{marginBlockStart: '20px'}}>
          Submit
        </PrimaryActionButton>
      </>
    ),
  ],
  parameters: {
    formik: {
      initialValues: {test: ''},
      onSubmit: fn(),
    },
  },

  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Hour'), '23');
    await userEvent.type(canvas.getByLabelText('Minute'), '60');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({
      test: '23:60:00',
    });
  },
};

export const WithoutLeadingZero: Story = {
  args: {
    name: 'test',
    label: 'Test time field',
    isDisabled: false,
    isRequired: true,
  },
  decorators: [
    Story => (
      <>
        <Story />
        <PrimaryActionButton type="submit" style={{marginBlockStart: '20px'}}>
          Submit
        </PrimaryActionButton>
      </>
    ),
  ],
  parameters: {
    formik: {
      initialValues: {test: ''},
      onSubmit: fn(),
    },
  },

  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Hour'), '2');
    await userEvent.type(canvas.getByLabelText('Minute'), '3');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({
      test: '02:03:00',
    });
  },
};
