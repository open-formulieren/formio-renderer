import type {RadioComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioRadioField} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / radio',
  component: FormioRadioField,
  decorators: [withFormik],
} satisfies Meta<typeof FormioRadioField>;

type Story = StoryObj<typeof FormioRadioField>;

const extensionBoilerplate: Pick<RadioComponentSchema, 'openForms'> = {
  openForms: {
    dataSrc: 'manual',
    translations: {},
  },
};

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'radio',
      key: 'my.radio',
      label: 'A radio choice',
      values: [
        {
          value: 'referenceLists',
          label: 'Reference lists',
        },
        {
          value: 'formVariable',
          label: 'Form variable',
        },
      ],
      defaultValue: null,
      ...extensionBoilerplate,
    } satisfies RadioComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          radio: null,
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'radio',
      key: 'my.radio',
      label: 'A radio choice',
      tooltip: 'Surprise!',
      description: 'A description',
      values: [
        {
          value: 'terra',
          label: 'Terra',
        },
        {
          value: 'ziggy',
          label: 'Ziggy',
        },
      ],
      defaultValue: null,
      ...extensionBoilerplate,
    } satisfies RadioComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          radio: null,
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: RadioComponentSchema;
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
      id: 'component1',
      type: 'radio',
      key: 'my.radio',
      label: 'A radio field',
      defaultValue: '',
      values: [
        {value: 'option1', label: 'Option 1'},
        {value: 'option2', label: 'Option 2'},
      ],
      validate: {
        required: true,
      },
      ...extensionBoilerplate,
    } satisfies RadioComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const radioLabel = canvas.getByText('A radio field');
    expect(radioLabel).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText('The required field A radio field must be filled in.')
    ).toBeVisible();
  },
};

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'radio',
      key: 'my.radio',
      label: 'A radio field',
      defaultValue: '',
      values: [
        {value: 'option1', label: 'Option 1'},
        {value: 'option2', label: 'Option 2'},
      ],
      validate: {
        required: true,
      },
      errors: {required: 'Custom error message for required'},
      ...extensionBoilerplate,
    } satisfies RadioComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
  },
};

export const ValidateOptionalNull: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'radio',
      key: 'my.radio',
      label: 'A radio field',
      defaultValue: null,
      values: [
        {value: 'option1', label: 'Option 1'},
        {value: 'option2', label: 'Option 2'},
      ],
      validate: {
        required: false,
      },
      ...extensionBoilerplate,
    } satisfies RadioComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const radioLabel = canvas.getByText('A radio field');
    expect(radioLabel).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledOnce();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: RadioComponentSchema;
  value: string;
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

export const ValueDisplayStory: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  name: 'Value Display',
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'radio',
      key: 'my.radio',
      label: 'A radio',
      defaultValue: null,
      ...extensionBoilerplate,
      values: [
        {value: 'option1', label: 'Option 1'},
        {value: 'option2', label: 'Option 2'},
      ],
    } satisfies RadioComponentSchema,
    value: 'option1',
  },
};
