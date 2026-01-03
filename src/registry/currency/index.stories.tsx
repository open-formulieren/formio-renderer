import type {CurrencyComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import ValueDisplay from './ValueDisplay';
import {FormioCurrencyField as Currency} from './index';

export default {
  title: 'Component registry / basic / currency',
  component: Currency,
  decorators: [withFormik],
  globals: {
    locale: 'nl',
  },
} satisfies Meta<typeof Currency>;

type Story = StoryObj<typeof Currency>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        currency: 12.34,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const numberField = canvas.getByLabelText('Currency');
    // Formatted using a non-breaking space
    expect(numberField).toHaveDisplayValue('€\u00A012,34');
  },
};

export const MinimalConfigurationWithEnglishLocale: Story = {
  args: {
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        currency: 12.34,
      },
    },
  },
  globals: {
    locale: 'en',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const numberField = canvas.getByLabelText('Currency');
    expect(numberField).toHaveDisplayValue('€12.34');
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
      description: 'A description',
      tooltip: 'A tooltip',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        currency: null,
      },
    },
  },
};

export const AdditionalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
      allowNegative: true,
      decimalLimit: 3,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        currency: -10.12345,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const numberField = canvas.getByLabelText('Currency');
    expect(numberField).toHaveDisplayValue('-€\u00A010,123');
  },
};

interface ValidationStoryArgs {
  componentDefinition: CurrencyComponentSchema;
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
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const currencyField = canvas.getByLabelText('Currency');
    expect(currencyField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText("Het verplichte veld 'Currency' is niet ingevuld.")
    ).toBeVisible();
  },
};

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
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

export const ValidateMax: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
      validate: {
        max: 10,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const currencyField = canvas.getByLabelText('Currency');
    const submit = canvas.getByRole('button', {name: 'Submit'});

    // Assert that value lower than max is fine
    await userEvent.type(currencyField, '9,1');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet € 10,00 of kleiner zijn.')).toBeNull();

    // Assert that value equal to max is fine
    await userEvent.clear(currencyField);
    await userEvent.type(currencyField, '10');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet € 10,00 of kleiner zijn.')).toBeNull();

    // Assert that value greater than max is not fine
    await userEvent.clear(currencyField);
    await userEvent.type(currencyField, '10,5');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet € 10,00 of kleiner zijn.')).toBeVisible();
  },
};

export const ValidateMaxWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
      validate: {
        max: 10,
      },
      errors: {max: 'Custom error message for max value'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const currencyField = canvas.getByLabelText('Currency');
    const submit = canvas.getByRole('button', {name: 'Submit'});

    await userEvent.type(currencyField, '10,1');
    await userEvent.click(submit);
    expect(canvas.queryByText('Custom error message for max value')).toBeVisible();
  },
};

export const ValidateMin: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
      validate: {
        min: 10,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const currencyField = canvas.getByLabelText('Currency');
    const submit = canvas.getByRole('button', {name: 'Submit'});

    // Assert that value greater than min is fine
    await userEvent.type(currencyField, '11,1');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet € 10,00 of groter zijn.')).toBeNull();

    // Assert that value equal to min is fine
    await userEvent.clear(currencyField);
    await userEvent.type(currencyField, '10');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet € 10,00 of groter zijn.')).toBeNull();

    // Assert that value less than min is not fine
    await userEvent.clear(currencyField);
    await userEvent.type(currencyField, '9,1');
    await userEvent.click(submit);
    expect(await canvas.findByText('De waarde moet € 10,00 of groter zijn.')).toBeVisible();
  },
};

export const ValidateMinWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'Currency',
      currency: 'EUR',
      validate: {
        min: 10,
      },
      errors: {min: 'Custom error message for min value'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const currencyField = canvas.getByLabelText('Currency');
    const submit = canvas.getByRole('button', {name: 'Submit'});

    await userEvent.type(currencyField, '9');
    await userEvent.click(submit);
    expect(canvas.queryByText('Custom error message for min value')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: CurrencyComponentSchema;
  value: number;
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
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'currency',
      currency: 'EUR',
    },
    value: 12.34,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('€ 12,34')).toBeInTheDocument();
  },
};

export const SingleValueDisplayWithEnglishLocale: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'currency',
      type: 'currency',
      key: 'currency',
      label: 'currency',
      currency: 'EUR',
      decimalLimit: 3,
    },
    value: 12.3456,
  },
  globals: {
    locale: 'en',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('€12.346')).toBeInTheDocument();
  },
};
