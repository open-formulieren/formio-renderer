import type {EmailComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioEmail} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / email',
  component: FormioEmail,
  decorators: [withFormik],
} satisfies Meta<typeof FormioEmail>;

type Story = StoryObj<typeof FormioEmail>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          email: '',
        },
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'email',
      label: 'Your email',
      placeholder: 'geralt@kaer.moh.en',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'email',
      label: 'Your email',
      tooltip: 'Surprise!',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
  },
};

export const WithAutoComplete: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'email',
      label: 'Your email',
      autocomplete: 'email',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          email: ['info@example.com', 'dummy@example.com'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          email: ['info@example.com', 'example.com'],
        },
      },
      initialErrors: {
        my: {
          email: [undefined, 'Not a valid email.'],
        },
      },
      initialTouched: {
        my: {
          email: [true, true],
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: EmailComponentSchema;
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

export const ValidateEmailFormat: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Your email');
    await userEvent.type(emailField, 'invalid');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid email')).toBeVisible();
  },
};

export const ValidateEmailRequired: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Your email');
    expect(emailField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidateEmailRequiredWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
      validate: {
        required: true,
      },
      errors: {required: 'Custom error for required'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error for required')).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Your email');
    await userEvent.type(emailField, 'info@example.com');

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
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
      multiple: true,
      validate: {
        required: true,
      },
    } satisfies EmailComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // ensure we have three items
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    const textboxes = canvas.getAllByRole('textbox');
    expect(textboxes).toHaveLength(3);

    await userEvent.type(textboxes[1], 'example.com'); // only domain
    await userEvent.type(textboxes[2], 'info@example.com'); // ok

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
    expect(await canvas.findByText('Invalid email')).toBeVisible();
  },
};

export const ValidationMultipleWithCustomErrorMessage: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'email',
      validateOn: 'blur', // ignored but required in the types
      key: 'my.email',
      label: 'Your email',
      multiple: true,
      validate: {
        required: true,
      },
      errors: {required: 'Custom error message for required with multiple: true'},
    } satisfies EmailComponentSchema,
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
      await canvas.findAllByText('Custom error message for required with multiple: true')
    ).toHaveLength(2);
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: EmailComponentSchema;
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
      type: 'email',
      key: 'my.email',
      label: 'An email',
      validateOn: 'blur',
      multiple: false,
    } satisfies EmailComponentSchema,
    value: 'openforms@example.com',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'my.email',
      label: 'An email',
      validateOn: 'blur',
      multiple: true,
    } satisfies EmailComponentSchema,
    value: ['openforms1@example.com', 'openforms2@example.com'],
  },
};
