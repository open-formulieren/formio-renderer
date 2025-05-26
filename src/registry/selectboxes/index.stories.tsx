import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioSelectboxes} from './';
import ValueDisplay from './ValueDisplay';
import type {ManualSelectboxesValuesSchema} from './types';

export default {
  title: 'Component registry / basic / selectboxes',
  component: FormioSelectboxes,
  decorators: [withFormik],
} satisfies Meta<typeof FormioSelectboxes>;

type Story = StoryObj<typeof FormioSelectboxes>;

const extensionBoilerplate: Pick<ManualSelectboxesValuesSchema, 'openForms'> = {
  openForms: {
    dataSrc: 'manual',
    translations: {},
  },
};

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'selectboxes',
      key: 'my.selectboxes',
      label: 'Selecboxes choices',
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
      defaultValue: {referenceLists: false, formVariable: false},
      ...extensionBoilerplate,
    } satisfies ManualSelectboxesValuesSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          selectboxes: {
            referenceLists: false,
            formVariable: true,
          },
        },
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'selectboxes',
      key: 'my.selectboxes',
      label: 'Selecboxes choices',
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
      defaultValue: {terra: true, ziggy: true},
      ...extensionBoilerplate,
    } satisfies ManualSelectboxesValuesSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          selectboxes: {
            terra: true,
            ziggy: true,
          },
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: ManualSelectboxesValuesSchema;
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
      type: 'selectboxes',
      key: 'my.selectboxes',
      label: 'A selectboxes field',
      defaultValue: {option1: false, option2: false},
      values: [
        {value: 'option1', label: 'Option 1'},
        {value: 'option2', label: 'Option 2'},
      ],
      validate: {
        required: true,
      },
      ...extensionBoilerplate,
    } satisfies ManualSelectboxesValuesSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const selectboxesLabel = canvas.getByText('A selectboxes field');
    expect(selectboxesLabel).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: ManualSelectboxesValuesSchema;
  value: Record<string, boolean>;
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
      type: 'selectboxes',
      key: 'my.selectboxes',
      label: 'A radio',
      defaultValue: {},
      ...extensionBoilerplate,
      values: [
        {value: 'option1', label: 'Option 1'},
        {value: 'option2', label: 'Option 2'},
      ],
    } satisfies ManualSelectboxesValuesSchema,
    value: {option1: true, option2: true},
  },
};
