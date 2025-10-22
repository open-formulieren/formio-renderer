import type {Meta, StoryObj} from '@storybook/react-vite';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {addDays, subDays} from 'date-fns';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import {withFormSettingsProvider, withFormik, withMockDate} from '@/sb-decorators';

import DateTimeField from './DateTimeField';

export default {
  title: 'Internal API / Forms / DateTimeField',
  component: DateTimeField,
  decorators: [withFormik],
  args: {
    name: 'datetime',
    label: 'Datetime field',
    isRequired: true,
    isDisabled: false,
    description: '',
  },
  parameters: {
    formik: {
      initialValues: {
        datetime: '',
      },
    },
  },
  globals: {
    locale: 'nl',
  },
} satisfies Meta<typeof DateTimeField>;

type Story = StoryObj<typeof DateTimeField>;

export const Default: Story = {
  decorators: [withMockDate],
  args: {
    name: 'datetime',
    label: 'Datetime',
    description: 'This is a custom description',
    tooltip: 'A short tooltip.',
    isDisabled: false,
    isRequired: true,
  },
  parameters: {
    mockDate: new Date('2025-09-29T12:00:00+02:00'),
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Ensure we have a placeholder formatted according to the locale
    const datetime = canvas.getByPlaceholderText('d-m-jjjj HH:MM');
    expect(datetime).toBeInTheDocument();

    // Ensure clicking the icon opens the calendar
    expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByLabelText('Toon/verberg de kalender'));
    expect(canvas.getByRole('dialog')).toBeVisible();
  },
};

export const EnglishLocale: Story = {
  args: {
    name: 'datetime',
    label: 'Datetime',
    description: 'This is a custom description',
    tooltip: 'A short tooltip.',
    isDisabled: false,
    isRequired: true,
  },
  globals: {
    locale: 'en',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Ensure we have a placeholder formatted according to the locale
    const datetime = canvas.getByPlaceholderText('m/d/yyyy HH:MM');
    expect(datetime).toBeInTheDocument();
  },
};

const sept29th = new Date('2025-09-29T12:00:00+02:00');

export const LimitedRange: Story = {
  decorators: [withMockDate],
  args: {
    name: 'datetime',
    label: 'Datetime',
    isDisabled: false,
    isRequired: true,
    minDate: subDays(sept29th, 3),
    maxDate: addDays(sept29th, 3),
  },
  parameters: {
    mockDate: sept29th,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Calendar is by default not visible, until you focus the field
    expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByText('Datetime'));
    expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};

export const SelectDateAndTimeInDateTimePicker: Story = {
  args: {
    name: 'datetime',
    label: 'Datetime',
    isDisabled: false,
    isRequired: false,
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
      initialValues: {datetime: '2025-10-20T12:34:00T+02:00'},
      onSubmit: fn(),
    },
    chromatic: {disableSnapshot: true}, // don't create snapshots because we can't set the timezone for chromatic
  },
  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    // Open the floating widget
    const datetime = canvas.getByLabelText('Datetime');
    await userEvent.click(datetime);

    // Pick a date
    const date = await canvas.findByRole('button', {name: 'woensdag 22 oktober 2025'});
    await userEvent.click(date);
    expect(date).toBeVisible();
    expect(date).toHaveClass('utrecht-calendar__table-days-item-day--selected');

    // Pick a time
    const time = canvas.getByLabelText('Time');
    await userEvent.clear(time);
    await userEvent.type(time, '1052');
    expect(time).toHaveDisplayValue('10:52');

    // Ensure the text input has the picked date and time
    expect(datetime).toHaveDisplayValue('22-10-2025 10:52');

    // Ensure that the date is formatted as an ISO-8601 string on submit
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({datetime: '2025-10-22T10:52:00+02:00'});
  },
};

export const TypeDateManually: Story = {
  args: {
    name: 'datetime',
    label: 'Datetime',
    isDisabled: false,
    isRequired: false,
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
      onSubmit: fn(),
    },
    chromatic: {disableSnapshot: true}, // don't create snapshots because we can't set the timezone for chromatic
  },
  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByRole('dialog')).toBeNull();
    const datetime = canvas.getByLabelText('Datetime');
    await userEvent.type(datetime, '29-08-2025 12:34');
    expect(datetime).toHaveDisplayValue('29-08-2025 12:34');

    // Ensure formatting is applied on blur
    datetime.blur();
    await waitFor(() => {
      expect(canvas.queryByRole('dialog')).toBeNull();
    });
    expect(datetime).toHaveDisplayValue('29-8-2025 12:34');

    // Ensure that the date is properly highlighted in the calendar
    await userEvent.click(datetime);
    expect(await canvas.findByRole('dialog')).toBeVisible();
    const selectedEventButton = await canvas.findByRole('button', {
      name: 'vrijdag 29 augustus 2025',
    });
    expect(selectedEventButton).toBeVisible();
    expect(selectedEventButton).toHaveClass('utrecht-calendar__table-days-item-day--selected');

    // Ensure that the time is displayed
    const time = await canvas.getByLabelText('Time');
    expect(time).toHaveValue('12:34');

    // Ensure that the datetime is formatted as an ISO-8601 string on submit
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({datetime: '2025-08-29T12:34:00+02:00'});
  },
};

export const InitialValueAndValidationError: Story = {
  args: {
    name: 'datetime',
    label: 'Datetime',
    isDisabled: false,
    isRequired: false,
  },
  parameters: {
    formik: {
      initialValues: {
        datetime: '2025-08-29T12:34:00',
      },
      initialErrors: {
        datetime: 'A validation error',
      },
      initialTouched: {
        datetime: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByLabelText('Datetime')).toHaveDisplayValue('29-8-2025 12:34');
    expect(canvas.getByText('A validation error')).toBeVisible();
  },
};

export const NoAsterisksForRequired = {
  decorators: [withFormSettingsProvider],
  args: {
    name: 'datetime',
    label: 'Datetime',
    isRequired: true,
  },
  parameters: {
    formSettings: {
      requiredFieldsWithAsterisk: false,
    },
  },
};
