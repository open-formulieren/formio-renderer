import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioRadioField} from './';
import ValueDisplay from './ValueDisplay';
import type {ManualRadioValuesSchema} from './types';

export default {
  title: 'Component registry / basic / radio',
  component: FormioRadioField,
  decorators: [withFormik],
} satisfies Meta<typeof FormioRadioField>;

type Story = StoryObj<typeof FormioRadioField>;

const extensionBoilerplate: Pick<ManualRadioValuesSchema, 'openForms'> = {
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
    } satisfies ManualRadioValuesSchema,
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
    } satisfies ManualRadioValuesSchema,
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
  componentDefinition: ManualRadioValuesSchema;
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
    } satisfies ManualRadioValuesSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const radioLabel = canvas.getByText('A radio field');
    expect(radioLabel).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
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
    } satisfies ManualRadioValuesSchema,
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
  componentDefinition: ManualRadioValuesSchema;
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
    } satisfies ManualRadioValuesSchema,
    value: 'option1',
  },
};
