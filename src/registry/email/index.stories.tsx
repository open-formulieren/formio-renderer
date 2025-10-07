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
