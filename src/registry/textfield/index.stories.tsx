import type {TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';
import type {ValidatePluginCallback} from '@/validationSchema';

import {FormioTextField as TextField} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / textfield',
  component: TextField,
  decorators: [withFormik],
} satisfies Meta<typeof TextField>;

type Story = StoryObj<typeof TextField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A simple textfield',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: '',
        },
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'textfield',
      label: 'A simple textfield',
      placeholder: 'Ada',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        textfield: '',
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A simple textfield',
      tooltip: 'Surprise!',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: '',
        },
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A simple textfield',
      description: 'A description below the fields',
      tooltip: 'Tooltip must still be rendered',
      placeholder: 'Placeholders too!',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: ['item 1', 'item 2'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A simple textfield',
      description: 'A description below the fields',
      tooltip: 'Tooltip must still be rendered',
      placeholder: 'Placeholders too!',
      multiple: true,
      validate: {maxLength: 3},
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: ['ok', 'too long'],
        },
      },
      initialErrors: {
        my: {
          textfield: [undefined, 'The value must be maximum 3 characters long.'],
        },
      },
      initialTouched: {
        my: {
          textfield: [true, true],
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: TextFieldComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: renderComponentInForm,
  parameters: {
    formik: {
      disable: true,
    },
    formSettings: {
      validatePluginCallback: (async (plugin: string) => {
        if (['mock1', 'mock2'].includes(plugin)) {
          return {
            valid: false,
            messages: [`Does not pass ${plugin} plugin validation.`],
          };
        }
        return {valid: true};
      }) satisfies ValidatePluginCallback,
    },
  },
};

export const ValidateRequired: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        required: true,
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    expect(textField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateRequiredWithCustomMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        required: true,
      },
      errors: {
        required: 'Custom error message for required',
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
  },
};

export const ValidateMaxLength: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        maxLength: 3,
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'too long');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('String must contain at most 3 character(s)')).toBeVisible();
  },
};

export const ValidateMaxLengthWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        maxLength: 3,
      },
      errors: {
        maxLength: 'Custom error message for max length',
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'too long');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for max length')).toBeVisible();
  },
};

export const ValidatePattern: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        pattern: '^yeet{1,3}$',
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'ayeet');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid')).toBeVisible();
  },
};

export const ValidatePatternWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        pattern: '^yeet{1,3}$',
      },
      errors: {
        pattern: 'Custom error message for pattern',
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'ayeet');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for pattern')).toBeVisible();
  },
};

export const ValidatePlugin: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        plugins: ['mock1', 'mock2'],
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'ayeet');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText(
        'Does not pass mock1 plugin validation. Does not pass mock2 plugin validation.'
      )
    ).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      validate: {
        required: true,
        pattern: '[a-zA-Z]{2}[0-9]{2,4}.*',
        maxLength: 10,
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const textField = canvas.getByLabelText('A textfield');
    await userEvent.type(textField, 'ab999cd');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalled();
  },
};

export const ValidationMultiple: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      multiple: true,
      validate: {
        maxLength: 5,
        pattern: '^yeet{1,3}$',
      },
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have three items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(3);

    await userEvent.type(textboxes[0], 'yeettt'); // too long
    await userEvent.type(textboxes[1], 'ayeet'); // no pattern match
    await userEvent.type(textboxes[2], 'yeett'); // ok

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('String must contain at most 5 character(s)')).toBeVisible();
    expect(await canvas.findByText('Invalid')).toBeVisible();
  },
};

export const ValidationMultipleWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      multiple: true,
      validate: {
        required: true,
      },
      errors: {required: 'Custom error message for required and multiple: true'},
    } satisfies TextFieldComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have multiple items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(2);

    // trigger validation
    await userEvent.click(textboxes[0]);
    await userEvent.click(textboxes[1]);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findAllByText('Custom error message for required and multiple: true')
    ).toHaveLength(2);
  },
};

export const ValidationMultipleAndPlugin: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      multiple: true,
      validate: {
        maxLength: 10,
        plugins: ['fail'],
      },
    } satisfies TextFieldComponentSchema,
  },
  parameters: {
    ...BaseValidationStory.parameters,
    formSettings: {
      ...BaseValidationStory.parameters!.formSettings,
      validatePluginCallback: (async (_, value: string) => {
        if (value === 'fail-me') {
          return {
            valid: false,
            messages: [`Failure requested.`],
          };
        }
        return {valid: true};
      }) satisfies ValidatePluginCallback,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have three items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(3);

    await userEvent.type(textboxes[0], 'this value is too long'); // too long
    await userEvent.type(textboxes[1], 'fail-me'); // plugin validator rejects
    await userEvent.type(textboxes[2], 'okay'); // ok

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('String must contain at most 10 character(s)')).toBeVisible();
    expect(await canvas.findByText('Failure requested.')).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: TextFieldComponentSchema;
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
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      multiple: false,
    } satisfies TextFieldComponentSchema,
    value: 'Single value',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A textfield',
      multiple: true,
    } satisfies TextFieldComponentSchema,
    value: ['First', 'Second'],
  },
};
