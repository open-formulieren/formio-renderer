import {TextareaComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
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
