import type {DateTimeComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioDateTime} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / datetime',
  component: FormioDateTime,
  decorators: [withFormik],
  globals: {locale: 'nl'},
} satisfies Meta<typeof FormioDateTime>;

type Story = StoryObj<typeof FormioDateTime>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
    } satisfies DateTimeComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        date: {
          time: '',
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      tooltip: 'Surprise!',
      description: 'A description',
    } satisfies DateTimeComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        date: {
          time: '',
        },
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        date: {
          time: ['2025-10-22T16:00:00+02:00', '2025-11-22T07:07:00+00:00'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        date: {
          time: ['2025-10-22T16:00:00+02:00', 'not-a-datetime'],
        },
      },
      initialErrors: {
        date: {
          time: [undefined, 'Not a valid datetime.'],
        },
      },
      initialTouched: {
        date: {
          time: [true, true],
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: DateTimeComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: renderComponentInForm,
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const ValidateRequired: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      validate: {
        required: true,
      },
    } satisfies DateTimeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const InvalidDateTime: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      validate: {
        required: false,
      },
    } satisfies DateTimeComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const date = canvas.getByLabelText('Datetime');
    await userEvent.type(date, '32-13-2025 12:34');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText(/De datum en tijd moeten een datumdeel en een tijdsdeel hebben/)
    ).toBeVisible();

    expect(date).toHaveDisplayValue('32-13-2025 12:34');
  },
};

export const MinMaxValidation: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      datePicker: {
        minDate: '2025-10-08T12:00', // this is how the value is set in the form builder
        maxDate: '2025-10-10T19:00',
        showWeeks: false,
        startingDay: 0,
        initDate: '',
        minMode: 'day',
        maxMode: 'day',
        yearRows: 0,
        yearColumns: 0,
      },
    } satisfies DateTimeComponentSchema,
  },
  parameters: {
    ...BaseValidationStory.parameters,
    chromatic: {disableSnapshot: true}, // don't create snapshots because we can't set the timezone for chromatic
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const date = canvas.getByLabelText('Datetime');
    const button = canvas.getByRole('button', {name: 'Submit'});

    await step('Date before date range', async () => {
      await userEvent.type(date, '8-10-2025 11:50');

      await userEvent.click(button);
      expect(
        await canvas.findByText('De datum en tijd moet gelijk aan of na 8-10-2025, 12:00 zijn.')
      ).toBeVisible();
      expect(args.onSubmit).not.toHaveBeenCalled();
    });

    await step('Date between in date range', async () => {
      await userEvent.clear(date);
      await userEvent.type(date, '8-10-2025 15:00');

      await userEvent.click(button);
      expect(await canvas.queryByText('Invalid input')).not.toBeInTheDocument();
      expect(args.onSubmit).toHaveBeenCalledWith({date: {time: '2025-10-08T15:00:00+02:00'}});
    });

    await step('Date after date range', async () => {
      await userEvent.clear(date);
      await userEvent.type(date, '10-10-2025 21:00');

      await userEvent.click(button);
      expect(
        await canvas.findByText('De datum en tijd moet gelijk aan of voor 10-10-2025, 19:00 zijn.')
      ).toBeVisible();
      // Still should have only been called once with the valid date from the previous step
      expect(args.onSubmit).toHaveBeenCalledWith({date: {time: '2025-10-08T15:00:00+02:00'}});
    });
  },
};

export const MinMaxValidationWithEnglishLocale: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      datePicker: {
        minDate: '2025-10-08T12:00', // this is how the value is set in the form builder
        maxDate: '2025-10-10T19:00',
        showWeeks: false,
        startingDay: 0,
        initDate: '',
        minMode: 'day',
        maxMode: 'day',
        yearRows: 0,
        yearColumns: 0,
      },
    } satisfies DateTimeComponentSchema,
  },
  parameters: {
    ...BaseValidationStory.parameters,
    chromatic: {disableSnapshot: true}, // don't create snapshots because we can't set the timezone for chromatic
  },
  globals: {locale: 'en'},
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const date = canvas.getByLabelText('Datetime');
    const button = canvas.getByRole('button', {name: 'Submit'});

    await step('Date before date range', async () => {
      await userEvent.type(date, '10/8/2025 11:50 AM');

      await userEvent.click(button);
      expect(
        await canvas.findByText('The datetime must be later than or equal to 10/8/2025, 12:00 PM.')
      ).toBeVisible();
      expect(args.onSubmit).not.toHaveBeenCalled();
    });

    await step('Date between in date range', async () => {
      await userEvent.clear(date);
      await userEvent.type(date, '10/8/2025 3:00 PM');

      await userEvent.click(button);
      expect(await canvas.queryByText('Invalid input')).not.toBeInTheDocument();
      expect(args.onSubmit).toHaveBeenCalledWith({date: {time: '2025-10-08T15:00:00+02:00'}});
    });

    await step('Date after date range', async () => {
      await userEvent.clear(date);
      await userEvent.type(date, '10/10/2025 9:00 PM');

      await userEvent.click(button);
      await expect(
        canvas.queryByText('The datetime must be earlier than or equal to 10/10/2025, 7:00 PM.')
      ).toBeVisible();
      // Still should have only been called once with the valid date from the previous step
      expect(args.onSubmit).toHaveBeenCalledWith({date: {time: '2025-10-08T15:00:00+02:00'}});
    });
  },
};

export const InvalidMultipleDateTime: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      validate: {
        required: false,
      },
      multiple: true,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const date = await canvas.findByLabelText('Datetime 1');
    await userEvent.type(date, '13/32/2000 16:00 AM');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText(/De datum en tijd moeten een datumdeel en een tijdsdeel hebben/)
    ).toBeVisible();

    expect(date).toHaveDisplayValue('13/32/2000 16:00 AM');
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: DateTimeComponentSchema;
  value: string | string[];
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

const BaseValueDisplayStory: ValueDisplayStory = {
  render: args => <ValueDisplay {...args} />,
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const SingleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      multiple: false,
    } satisfies DateTimeComponentSchema,
    value: '1980-01-01T12:34:56',
  },
};

export const SingleEmptyValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      multiple: false,
    } satisfies DateTimeComponentSchema,
    value: '',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'datetime',
      type: 'datetime',
      key: 'date.time',
      label: 'Datetime',
      multiple: true,
    } satisfies DateTimeComponentSchema,
    value: ['1980-01-01T12:34:56', '', '2025-10-08T14:09:44'],
  },
};
