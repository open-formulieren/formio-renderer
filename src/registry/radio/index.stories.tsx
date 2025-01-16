import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioForm, {FormioFormProps} from '@/components/FormioForm';
import {withFormik} from '@/sb-decorators';

import RadioField from './';
import type {ManualRadioValuesSchema} from './types';

export default {
  title: 'Component registry / basic / radio',
  component: RadioField,
  decorators: [withFormik],
} satisfies Meta<typeof RadioField>;

type Story = StoryObj<typeof RadioField>;

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

interface ValidationStoryArgs {
  componentDefinition: ManualRadioValuesSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: args => (
    <FormioForm onSubmit={args.onSubmit} components={[args.componentDefinition]}>
      <div style={{marginBlockStart: '20px'}}>
        <button type="submit">Submit</button>
      </div>
    </FormioForm>
  ),
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
