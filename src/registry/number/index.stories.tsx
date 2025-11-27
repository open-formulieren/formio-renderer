import type {NumberComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import ValueDisplay from './ValueDisplay';
import {FormioNumberField as Number} from './index';

export default {
  title: 'Component registry / basic / number',
  component: Number,
  decorators: [withFormik],
  globals: {
    locale: 'nl',
  },
} satisfies Meta<typeof Number>;

type Story = StoryObj<typeof Number>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        number: 12.34,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const numberField = canvas.getByLabelText('Number');
    expect(numberField).toHaveDisplayValue('12,34');
  },
};

export const MinimalConfigurationWithEnglishLocale: Story = {
  args: {
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        number: 12.34,
      },
    },
  },
  globals: {
    locale: 'en',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const numberField = canvas.getByLabelText('Number');
    expect(numberField).toHaveDisplayValue('12.34');
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validateOn: 'blur',
      description: 'A description',
      tooltip: 'A tooltip',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        number: null,
      },
    },
  },
};

export const AdditionalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validateOn: 'blur',
      allowNegative: true,
      suffix: 'm<sup>2</sup>',
      decimalLimit: 2,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        number: -10.12345,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const numberField = canvas.getByLabelText('Number');
    expect(numberField).toHaveDisplayValue('-10,12');
  },
};

interface ValidationStoryArgs {
  componentDefinition: NumberComponentSchema;
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
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validate: {
        required: true,
      },
      validateOn: 'blur',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const numberField = canvas.getByLabelText('Number');
    expect(numberField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText("Het verplichte veld 'Number' is niet ingevuld.")).toBeVisible();
  },
};

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validate: {
        required: true,
      },
      validateOn: 'blur',
      errors: {required: 'Custom errom message for required'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom errom message for required')).toBeVisible();
  },
};

export const ValidateMax: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validate: {
        max: 10,
      },
      validateOn: 'blur',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const number = canvas.getByLabelText('Number');
    const submit = canvas.getByRole('button', {name: 'Submit'});

    // Assert that value lower than max is fine
    await userEvent.type(number, '9,1');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet 10 of kleiner zijn.')).toBeNull();

    // Assert that value equal to max is fine
    await userEvent.clear(number);
    await userEvent.type(number, '10');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet 10 of kleiner zijn.')).toBeNull();

    // Assert that value greater than max is not fine
    await userEvent.clear(number);
    await userEvent.type(number, '10,5');
    await userEvent.click(submit);
    expect(await canvas.findByText('De waarde moet 10 of kleiner zijn.')).toBeVisible();
  },
};

export const ValidateMaxWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validate: {
        max: 10,
      },
      validateOn: 'blur',
      errors: {max: 'Custom error message for max value'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const number = canvas.getByLabelText('Number');
    const submit = canvas.getByRole('button', {name: 'Submit'});

    await userEvent.type(number, '12');
    await userEvent.click(submit);

    expect(await canvas.findByText('Custom error message for max value')).toBeVisible();
  },
};

export const ValidateMin: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validate: {
        min: 10,
      },
      validateOn: 'blur',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const number = canvas.getByLabelText('Number');
    const submit = canvas.getByRole('button', {name: 'Submit'});

    // Assert that value greater than min is fine
    await userEvent.type(number, '11,1');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet 10 of groter zijn.')).toBeNull();

    // Assert that value equal to min is fine
    await userEvent.clear(number);
    await userEvent.type(number, '10');
    await userEvent.click(submit);
    expect(canvas.queryByText('De waarde moet 10 of groter zijn.')).toBeNull();

    // Assert that value less than min is not fine
    await userEvent.clear(number);
    await userEvent.type(number, '9,1');
    await userEvent.click(submit);
    expect(await canvas.findByText('De waarde moet 10 of groter zijn.')).toBeVisible();
  },
};

export const ValidateMinWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validate: {
        min: 10,
      },
      validateOn: 'blur',
      errors: {min: 'Custom error message for min value'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const number = canvas.getByLabelText('Number');
    const submit = canvas.getByRole('button', {name: 'Submit'});

    await userEvent.type(number, '5');
    await userEvent.click(submit);

    expect(await canvas.findByText('Custom error message for min value')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: NumberComponentSchema;
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
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validateOn: 'blur',
      decimalLimit: 4,
    },
    value: 12.3456789,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('12,3457')).toBeInTheDocument();
  },
};

export const SingleValueDisplayWithEnglishLocale: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'number',
      type: 'number',
      key: 'number',
      label: 'Number',
      validateOn: 'blur',
      decimalLimit: 2,
    },
    value: 12.345678,
  },
  globals: {
    locale: 'en',
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('12.35')).toBeInTheDocument();
  },
};
