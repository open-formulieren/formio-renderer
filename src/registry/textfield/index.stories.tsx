import type {TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

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
