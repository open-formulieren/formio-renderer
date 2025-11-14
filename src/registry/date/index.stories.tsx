import type {DateComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioDate} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / date',
  component: FormioDate,
  decorators: [withFormik],
} satisfies Meta<typeof FormioDate>;

type Story = StoryObj<typeof FormioDate>;

export const MinimalConfigurationInputGroup: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: '',
        },
      },
    },
  },
};

export const MinimalConfigurationDatePicker: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'datePicker'},
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: '',
        },
      },
    },
  },
};

export const WithTooltipInputGroup: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      tooltip: 'Surprise!',
      description: 'A description',
      openForms: {translations: {}, widget: 'inputGroup'},
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: '',
        },
      },
    },
  },
};

export const WithTooltipDatePicker: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      tooltip: 'Surprise!',
      description: 'A description',
      openForms: {translations: {}, widget: 'datePicker'},
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: '',
        },
      },
    },
  },
};

export const MultipleInputGroup: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      multiple: true,
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: ['2025-10-23', '2000-01-01'],
        },
      },
    },
  },
};

export const MultipleInputGroupAutofocus: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      multiple: true,
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: ['2025-10-23'],
        },
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Add another'}));
    const secondItem = canvas.getByRole('group', {name: 'Your date 2'});
    expect(secondItem).toBeVisible();
    const monthInput = within(secondItem).getByLabelText('Month');
    expect(monthInput).toHaveFocus();
  },
};

export const MultipleDatePicker: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'datePicker'},
      multiple: true,
    } satisfies DateComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          date: ['2025-10-23', '2000-01-01'],
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: DateComponentSchema;
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

export const ValidateRequiredInputGroup: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const yearInput = canvas.getByLabelText('Year');
    expect(yearInput).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateRequiredInputGroupWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      validate: {
        required: true,
      },
      errors: {required: 'Custom error message for required'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
  },
};

export const ValidateRequiredDatePicker: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'datePicker'},
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const InvalidDateInputGroup: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      validate: {
        required: false,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const monthInput = canvas.getByLabelText('Month');
    await userEvent.type(monthInput, '13');

    const dayInput = canvas.getByLabelText('Day');
    await userEvent.type(dayInput, '8');

    const yearInput = canvas.getByLabelText('Year');
    await userEvent.type(yearInput, '2000');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid input')).toBeVisible();

    expect(monthInput).toHaveDisplayValue('13');
    expect(dayInput).toHaveDisplayValue('8');
    expect(yearInput).toHaveDisplayValue('2000');
  },
};

export const InvalidDateInputGroupWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      validate: {
        required: false,
      },
      errors: {invalid_date: 'Custom error message for invalid date'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const monthInput = canvas.getByLabelText('Month');
    await userEvent.type(monthInput, '13');

    const dayInput = canvas.getByLabelText('Day');
    await userEvent.type(dayInput, '8');

    const yearInput = canvas.getByLabelText('Year');
    await userEvent.type(yearInput, '2000');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for invalid date')).toBeVisible();
  },
};

export const InvalidDateDatePicker: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'datePicker'},
      validate: {
        required: false,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const date = canvas.getByLabelText('Your date');
    await userEvent.type(date, '13/32/2000');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid input')).toBeVisible();

    expect(date).toHaveDisplayValue('13/32/2000');
  },
};

export const MinMaxValidationInputGroup: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      datePicker: {
        minDate: '2025-09-05',
        maxDate: '2025-09-10',
        showWeeks: false,
        startingDay: 0,
        initDate: '',
        minMode: 'day',
        maxMode: 'day',
        yearRows: 0,
        yearColumns: 0,
      },
    },
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const monthInput = canvas.getByLabelText('Month');
    const dayInput = canvas.getByLabelText('Day');
    const yearInput = canvas.getByLabelText('Year');
    const button = canvas.getByRole('button', {name: 'Submit'});

    await userEvent.type(monthInput, '9');
    await userEvent.type(yearInput, '2025');

    await step('Date before date range', async () => {
      await userEvent.type(dayInput, '4');

      await userEvent.click(button);
      expect(
        await canvas.findByText(/Date must be greater than or equal to Fri Sep 05 2025/)
      ).toBeVisible();
      expect(args.onSubmit).not.toHaveBeenCalled();
    });

    await step('Date between in date range', async () => {
      await userEvent.clear(dayInput);
      await userEvent.type(dayInput, '8');

      await userEvent.click(button);
      expect(await canvas.queryByText('Invalid input')).not.toBeInTheDocument();
      expect(args.onSubmit).toHaveBeenCalledWith({my: {date: '2025-09-08'}});
    });

    await step('Date after date range', async () => {
      await userEvent.clear(dayInput);
      await userEvent.type(dayInput, '15');

      await userEvent.click(button);
      expect(
        await canvas.queryByText(/Date must be smaller than or equal to Wed Sep 10 2025/)
      ).toBeVisible();
      // Still should have only been called once with the valid date from the previous step
      expect(args.onSubmit).toHaveBeenCalledWith({my: {date: '2025-09-08'}});
    });
  },
};

export const MinMaxValidationInputGroupWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      errors: {minDate: 'Custom error for min date', maxDate: 'Custom error for max date'},
      datePicker: {
        minDate: '2025-09-05',
        maxDate: '2025-09-10',
        showWeeks: false,
        startingDay: 0,
        initDate: '',
        minMode: 'day',
        maxMode: 'day',
        yearRows: 0,
        yearColumns: 0,
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const monthInput = canvas.getByLabelText('Month');
    const dayInput = canvas.getByLabelText('Day');
    const yearInput = canvas.getByLabelText('Year');
    const button = canvas.getByRole('button', {name: 'Submit'});

    await userEvent.type(monthInput, '9');
    await userEvent.type(yearInput, '2025');

    await step('Date before date range', async () => {
      await userEvent.type(dayInput, '4');

      await userEvent.click(button);
      expect(await canvas.findByText('Custom error for min date')).toBeVisible();
    });

    await step('Date after date range', async () => {
      await userEvent.clear(dayInput);
      await userEvent.type(dayInput, '11');

      await userEvent.click(button);
      expect(await canvas.findByText('Custom error for max date')).toBeVisible();
    });
  },
};

export const MinMaxValidationDatePicker: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'datePicker'},
      datePicker: {
        minDate: '2025-09-05',
        maxDate: '2025-09-10',
        showWeeks: false,
        startingDay: 0,
        initDate: '',
        minMode: 'day',
        maxMode: 'day',
        yearRows: 0,
        yearColumns: 0,
      },
    },
  },
  play: async ({canvasElement, step, args}) => {
    const canvas = within(canvasElement);
    const date = canvas.getByLabelText('Your date');
    const button = canvas.getByRole('button', {name: 'Submit'});

    await step('Date before date range', async () => {
      await userEvent.type(date, '9/4/2025');

      await userEvent.click(button);
      expect(
        await canvas.findByText(/Date must be greater than or equal to Fri Sep 05 2025/)
      ).toBeVisible();
      expect(args.onSubmit).not.toHaveBeenCalled();
    });

    await step('Date between in date range', async () => {
      await userEvent.clear(date);
      await userEvent.type(date, '9/8/2025');

      await userEvent.click(button);
      expect(await canvas.queryByText('Invalid input')).not.toBeInTheDocument();
      expect(args.onSubmit).toHaveBeenCalledWith({my: {date: '2025-09-08'}});
    });

    await step('Date after date range', async () => {
      await userEvent.clear(date);
      await userEvent.type(date, '9/15/2025');

      await userEvent.click(button);
      expect(
        await canvas.queryByText(/Date must be smaller than or equal to Wed Sep 10 2025/)
      ).toBeVisible();
      // Still should have only been called once with the valid date from the previous step
      expect(args.onSubmit).toHaveBeenCalledWith({my: {date: '2025-09-08'}});
    });
  },
};

export const InvalidMultipleDateInputGroup: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'inputGroup'},
      validate: {
        required: false,
      },
      multiple: true,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const monthInput = canvas.getByLabelText('Month');
    await userEvent.type(monthInput, '13');

    const dayInput = canvas.getByLabelText('Day');
    await userEvent.type(dayInput, '8');

    const yearInput = canvas.getByLabelText('Year');
    await userEvent.type(yearInput, '2000');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid input')).toBeVisible();

    expect(monthInput).toHaveDisplayValue('13');
    expect(dayInput).toHaveDisplayValue('8');
    expect(yearInput).toHaveDisplayValue('2000');
  },
};

export const InvalidMultipleDateDatePicker: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'Your date',
      openForms: {translations: {}, widget: 'datePicker'},
      validate: {
        required: false,
      },
      multiple: true,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const date = await canvas.findByLabelText('Your date 1');
    await userEvent.type(date, '13/32/2000');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid input')).toBeVisible();

    expect(date).toHaveDisplayValue('13/32/2000');
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: DateComponentSchema;
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
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'A date field',
      openForms: {translations: {}, widget: 'inputGroup'},
      multiple: false,
    } satisfies DateComponentSchema,
    value: '1980-01-01',
  },
};

export const SingleEmptyValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'A date field',
      openForms: {translations: {}, widget: 'inputGroup'},
      multiple: false,
    } satisfies DateComponentSchema,
    value: '',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'date',
      key: 'my.date',
      label: 'A date field',
      openForms: {translations: {}, widget: 'inputGroup'},
      multiple: true,
    } satisfies DateComponentSchema,
    value: ['1980-01-01', '', '2025-03-21'],
  },
};
