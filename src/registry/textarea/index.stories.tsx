import type {TextareaComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioTextarea as Textarea} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / textarea',
  component: Textarea,
  decorators: [withFormik],
} satisfies Meta<typeof Textarea>;

type Story = StoryObj<typeof Textarea>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A simple textarea',
      autoExpand: false,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textarea: '',
        },
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'textarea',
      label: 'A simple textarea',
      placeholder: 'Ada',
      autoExpand: false,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        textarea: '',
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A simple textarea',
      tooltip: 'Surprise!',
      autoExpand: false,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textarea: '',
        },
      },
    },
  },
};

export const WithRows: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A simple textarea',
      autoExpand: false,
      rows: 5,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textarea: '',
        },
      },
    },
  },
};

export const WithAutoComplete: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A simple textarea',
      autoExpand: false,
      autocomplete: 'firstname',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textarea: '',
        },
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByLabelText('A simple textarea');
    expect(textarea).toBeVisible();
    expect(textarea).toHaveAttribute('autocomplete', 'firstname');
  },
};

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A simple textarea',
      autoExpand: false,
      multiple: true,
    } satisfies TextareaComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textarea: ['lorem ipsum', 'dolor sed quiscat'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A simple textarea',
      autoExpand: false,
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textarea: ['Lorem Ipsum', 'single\nand multiline'],
        },
      },
      initialErrors: {
        my: {
          textarea: [undefined, 'Watch your language!'],
        },
      },
      initialTouched: {
        my: {
          textarea: [true, true],
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: TextareaComponentSchema;
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
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        required: true,
      },
    } satisfies TextareaComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByLabelText('A textarea');
    expect(textarea).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        required: true,
      },
      errors: {required: 'Custom error message for required'},
    } satisfies TextareaComponentSchema,
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
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        maxLength: 3,
      },
    } satisfies TextareaComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByLabelText('A textarea');
    await userEvent.type(textarea, 'too long');

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
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        maxLength: 3,
      },
      errors: {maxLength: 'Custom error message for max value'},
    } satisfies TextareaComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByLabelText('A textarea');
    await userEvent.type(textarea, 'too long');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for max value')).toBeVisible();
  },
};

export const ValidatePattern: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        pattern: '^yeet{1,3}$',
      },
    } satisfies TextareaComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByLabelText('A textarea');
    await userEvent.type(textarea, 'ayeet');

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
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        pattern: '^yeet{1,3}$',
      },
      errors: {pattern: 'Custom error message for pattern'},
    } satisfies TextareaComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByLabelText('A textarea');
    await userEvent.type(textarea, 'ayeet');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for pattern')).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        required: true,
        pattern: '[a-zA-Z]{2}[0-9]{2,4}.*',
        maxLength: 10,
      },
    } satisfies TextareaComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const textarea = canvas.getByLabelText('A textarea');
    await userEvent.type(textarea, 'ab999cd');

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
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        required: true,
        pattern: '[a-zA-Z]+',
      },
      multiple: true,
    } satisfies TextareaComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have three items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(3);

    await userEvent.type(textboxes[1], '123 + 456'); // does not match pattern
    await userEvent.type(textboxes[2], 'word'); // ok

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
    expect(await canvas.findByText('Invalid')).toBeVisible();
  },
};

export const ValidationMultipleWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      validate: {
        required: true,
        pattern: '[a-zA-Z]+',
      },
      multiple: true,
      errors: {required: 'Custom error message for required with multiple: true'},
    } satisfies TextareaComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have multiple items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(2);

    await userEvent.click(textboxes[0]);
    await userEvent.click(textboxes[1]);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findAllByText('Custom error message for required with multiple: true')
    ).toHaveLength(2);
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: TextareaComponentSchema;
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
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      multiple: false,
    } satisfies TextareaComponentSchema,
    value: 'Single value',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textarea',
      key: 'my.textarea',
      label: 'A textarea',
      autoExpand: false,
      multiple: true,
    } satisfies TextareaComponentSchema,
    value: ['First', 'Second'],
  },
};
