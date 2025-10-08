import type {Meta, StoryObj} from '@storybook/react-vite';
import {PrimaryActionButton} from '@utrecht/component-library-react';
import {addDays, subDays} from 'date-fns';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import {withFormSettingsProvider, withFormik, withMockDate} from '@/sb-decorators';

import DateField from '../DateField';

export default {
  title: 'Internal API / Forms / DateField / DatePicker',
  component: DateField,
  decorators: [withFormik],
  args: {
    name: 'date',
    label: 'Date field',
    isRequired: true,
    isDisabled: false,
    description: '',
    widget: 'datePicker',
  },
  parameters: {
    formik: {
      initialValues: {
        date: '',
      },
    },
  },
  globals: {
    locale: 'nl',
  },
} satisfies Meta<typeof DateField>;

type Story = StoryObj<typeof DateField>;

export const DatePicker: Story = {
  decorators: [withMockDate],
  args: {
    widget: 'datePicker',
    name: 'date',
    label: 'Date',
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
    const date = canvas.getByPlaceholderText('d-m-jjjj');
    expect(date).toBeInTheDocument();

    // Ensure clicking the icon opens the calendar
    expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByLabelText('Toon/verberg de kalender'));
    expect(canvas.getByRole('dialog')).toBeVisible();
  },
};

export const DatePickerWithEnglishLocale: Story = {
  args: {
    widget: 'datePicker',
    name: 'date',
    label: 'Date with English locale',
    description: 'This is a custom description',
    tooltip: 'A short tooltip',
    isDisabled: false,
    isRequired: true,
  },
  globals: {
    locale: 'en',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Ensure we have a placeholder formatted according to the locale
    const date = canvas.getByPlaceholderText('m/d/yyyy');
    expect(date).toBeInTheDocument();
  },
};

const sept29th = new Date('2025-09-29T12:00:00+02:00');

export const DatePickerLimitedRange: Story = {
  decorators: [withMockDate],
  args: {
    widget: 'datePicker',
    name: 'date',
    label: 'Date',
    isDisabled: false,
    isRequired: false,
    widgetProps: {
      minDate: subDays(sept29th, 3),
      maxDate: addDays(sept29th, 3),
    },
  },
  parameters: {
    mockDate: sept29th,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Calendar is by default not visible, until you focus the field
    expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByText('Date'));
    expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};

export const DatePickerDisabledDates: Story = {
  args: {
    widget: 'datePicker',
    name: 'date',
    label: 'Today disabled',
    description: 'This is a custom description',
    tooltip: 'A short tooltip.',
    isDisabled: false,
    isRequired: false,
    widgetProps: {
      disabledDates: ['2023-05-20', new Date().toISOString(), addDays(new Date(), 3).toISOString()],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        date: '2023-05-31',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    // calendar is by default not visible, until you focus the field
    expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByText('Today disabled'));

    expect(await canvas.findByRole('dialog')).toBeVisible();

    // today should be set to disabled
    const disabledEventButton = await canvas.findByRole('button', {name: 'zaterdag 20 mei 2023'});
    expect(disabledEventButton).toBeVisible();
    expect(disabledEventButton).toHaveClass('utrecht-button--disabled');
    expect(disabledEventButton).toBeDisabled();
  },
};

export const DatePickerKeyboardNavigation: Story = {
  args: {
    widget: 'datePicker',
    name: 'date',
    label: 'Date',
    isDisabled: false,
    isRequired: false,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Calendar is by default not visible, until you focus the field
    expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(canvas.getByText('Date'));
    expect(await canvas.findByRole('dialog')).toBeVisible();

    // Ensure ESC key closes the dialog again
    await userEvent.keyboard('[Escape]');
    expect(canvas.queryByRole('dialog')).toBeNull();
  },
};

export const DatePickerTypeDateManually: Story = {
  args: {
    widget: 'datePicker',
    name: 'date',
    label: 'Date',
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
  },
  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByRole('dialog')).toBeNull();
    const date = canvas.getByLabelText('Date');
    await userEvent.type(date, '29-08-2025');
    expect(date).toHaveDisplayValue('29-08-2025');

    // Ensure formatting is applied on blur
    date.blur();
    await waitFor(() => {
      expect(canvas.queryByRole('dialog')).toBeNull();
    });
    expect(date).toHaveDisplayValue('29-8-2025');

    // Ensure that the date is properly highlighted in the calendar
    await userEvent.click(date);
    expect(await canvas.findByRole('dialog')).toBeVisible();
    const selectedEventButton = await canvas.findByRole('button', {
      name: 'vrijdag 29 augustus 2025',
    });
    expect(selectedEventButton).toBeVisible();
    expect(selectedEventButton).toHaveClass('utrecht-calendar__table-days-item-day--selected');

    // Ensure that the date is formatted as an ISO-8601 string on submit
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({date: '2025-08-29'});
  },
};

export const DatePickerWithInitialValueAndValidationError: Story = {
  args: {
    widget: 'datePicker',
    name: 'date',
    label: 'Date',
    isDisabled: false,
    isRequired: false,
  },
  parameters: {
    formik: {
      initialValues: {
        date: '2025-08-29',
      },
      initialErrors: {
        date: 'A validation error',
      },
      initialTouched: {
        date: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByLabelText('Date')).toHaveDisplayValue('29-8-2025');
    expect(canvas.getByText('A validation error')).toBeVisible();
  },
};

export const NoAsterisksForRequired = {
  decorators: [withFormSettingsProvider],
  args: {
    widget: 'datePicker',
    name: 'test',
    label: 'Default required',
    isRequired: true,
  },
  parameters: {
    formSettings: {
      requiredFieldsWithAsterisk: false,
    },
  },
};
