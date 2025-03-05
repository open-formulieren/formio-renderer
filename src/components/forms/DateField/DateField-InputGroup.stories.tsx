import {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';
import {PrimaryActionButton, SecondaryActionButton} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';

import {withFormik} from '@/sb-decorators';

import DateField from './DateField';

export default {
  title: 'Internal API / Forms / DateField / InputGroup',
  component: DateField,
  decorators: [withFormik],
  args: {
    name: 'test',
    label: 'Test date field',
    isRequired: true,
    isDisabled: false,
    description: '',
    widget: 'inputGroup',
  },
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof DateField>;

type Story = StoryObj<typeof DateField>;

export const InputGroup: Story = {
  args: {
    widget: 'inputGroup',
    name: 'test',
    label: 'Test date field',
    description: 'This is a custom description',
    isDisabled: false,
    isRequired: true,
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole<HTMLInputElement>('textbox');
    expect(inputs).toHaveLength(3);
    await expect(canvas.getByText('Test date field')).toBeVisible();
    await expect(canvas.getByText('Year')).toBeVisible();
    await expect(canvas.getByText('Month')).toBeVisible();
    await expect(canvas.getByText('Day')).toBeVisible();
    await expect(canvas.getByText('This is a custom description')).toBeVisible();

    const inputsByName = Object.fromEntries(inputs.map(input => [input.name, input]));

    await step('Focus year', async () => {
      const yearLabel = canvas.getByText('Year');
      await userEvent.click(yearLabel);
      expect(inputsByName.year).toHaveFocus();
    });

    await step('Focus month', async () => {
      const monthLabel = canvas.getByText('Month');
      await userEvent.click(monthLabel);
      expect(inputsByName.month).toHaveFocus();
    });

    await step('Focus day', async () => {
      const dayLabel = canvas.getByText('Day');
      await userEvent.click(dayLabel);
      expect(inputsByName.day).toHaveFocus();
    });
  },
};

export const InputGroupSubmit: Story = {
  args: {
    widget: 'inputGroup',
    name: 'test',
    label: 'Test date field',
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

    await userEvent.type(canvas.getByLabelText('Day'), '15');
    await userEvent.type(canvas.getByLabelText('Month'), '2');
    await userEvent.type(canvas.getByLabelText('Year'), '2025');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({
      test: '2025-02-15',
    });
  },
};

export const InputGroupWithInitialValue: Story = {
  args: {
    widget: 'inputGroup',
  },
  parameters: {
    formik: {
      initialValues: {
        test: '2024-02-03',
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

    expect(canvas.getByLabelText('Day')).toHaveDisplayValue('3');
    expect(canvas.getByLabelText('Month')).toHaveDisplayValue('2');
    expect(canvas.getByLabelText('Year')).toHaveDisplayValue('2024');

    expect(canvas.getByText('A validation error')).toBeVisible();
  },
};

export const InputGroupReflectsExternalUpdates: Story = {
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
              setFieldValue(name, '2025-01-01');
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
      expect(canvas.getByLabelText('Day')).toHaveDisplayValue('');
      expect(canvas.getByLabelText('Month')).toHaveDisplayValue('');
      expect(canvas.getByLabelText('Year')).toHaveDisplayValue('');
    });

    await step('Change form field value from external trigger', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Alter value'}));
      expect(canvas.getByLabelText('Day')).toHaveDisplayValue('1');
      expect(canvas.getByLabelText('Month')).toHaveDisplayValue('1');
      expect(canvas.getByLabelText('Year')).toHaveDisplayValue('2025');
    });

    await step('Do not clear inputs for already invalid date', async () => {
      await userEvent.clear(canvas.getByLabelText('Month'));
      expect(canvas.getByLabelText('Day')).toHaveDisplayValue('1');
      expect(canvas.getByLabelText('Month')).toHaveDisplayValue('');
      expect(canvas.getByLabelText('Year')).toHaveDisplayValue('2025');
    });
  },
};

// Invalid input needs to be handled by form validation and not automatically
// reject inputs because of accessibility reasons - non-sighted users otherwise don't
// get feedback that the value was cleared. It's better to provide a clear error message
// that the value is not a valid date.
export const LeavesInvalidInputAlone: Story = {
  args: {
    widget: 'inputGroup',
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

    await userEvent.type(canvas.getByLabelText('Day'), '9');
    await userEvent.type(canvas.getByLabelText('Month'), '13');
    await userEvent.type(canvas.getByLabelText('Year'), '55555');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({
      test: '55555-13-09',
    });
  },
};
