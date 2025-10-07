import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitForElementToBeRemoved, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
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
          value: 'reference.Lists',
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
            'reference.Lists': false,
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

export const WithOptionDescriptions: Story = {
  ...MinimalConfiguration,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'selectboxes',
      key: 'my.selectboxes',
      label: 'Selecboxes choices',
      values: [
        {
          value: 'reference.Lists',
          label: 'Reference lists',
          description: 'An unexpected option description appears!',
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

export const ValidateMinRequiredOnBlur: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'selectboxes',
      key: 'my.selectboxes',
      label: 'A selectboxes field',
      defaultValue: {option1: false, option2: false, option3: false},
      values: [
        {value: 'option1', label: 'Option 1'},
        {value: 'option2', label: 'Option 2'},
        {value: 'option3', label: 'Option 3'},
      ],
      validate: {
        required: false,
        minSelectedCount: 2,
      },
      ...extensionBoilerplate,
    } satisfies ManualSelectboxesValuesSchema,
  },

  play: async ({canvasElement, args, step}) => {
    const canvas = within(canvasElement);

    const selectboxesLabel = canvas.getByText('A selectboxes field');
    expect(selectboxesLabel).toBeVisible();

    await step('valid state', async () => {
      await userEvent.click(canvas.getByLabelText('Option 2'));
      await userEvent.click(canvas.getByLabelText('Option 3'));
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      expect(args.onSubmit).toHaveBeenCalledOnce();
    });

    const errorMessage = 'You must select at least 2 items.';
    await step('validate on blur', async () => {
      await userEvent.click(canvas.getByLabelText('Option 3'));
      expect(canvas.queryByText(errorMessage)).not.toBeInTheDocument();
      const submitButton = canvas.getByRole('button', {name: 'Submit'});
      submitButton.focus();
      expect(await canvas.findByText(errorMessage)).toBeVisible();
    });

    await step('validate on non-checkbox click', async () => {
      const error = canvas.getByText(errorMessage);
      expect(error).toBeVisible();
      await userEvent.click(canvas.getByLabelText('Option 3'));
      // clicking the fieldset itself blurs the checkboxes and retriggers validation
      waitForElementToBeRemoved(error);
      await userEvent.click(canvas.getByRole('group'));
    });
  },
};

/**
 * Ensure that the string values for options are not interpreted as dotted paths.
 */
export const SillyOptionValues: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'selectboxes',
      type: 'selectboxes',
      key: 'selectboxes',
      label: 'Silly values',
      values: [
        {value: 'opti.on', label: 'Option 1'},
        {value: 'opt[io]', label: 'Option 2'},
      ],
      defaultValue: {},
      ...extensionBoilerplate,
    } satisfies ManualSelectboxesValuesSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByLabelText('Option 1'));
    await userEvent.click(canvas.getByLabelText('Option 2'));

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalledWith({
      selectboxes: {
        'opti.on': true,
        'opt[io]': true,
      },
    });
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
      label: 'Selectboxes',
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
