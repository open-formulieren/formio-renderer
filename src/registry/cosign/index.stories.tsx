import type {CosignV2ComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioCosign} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / custom / cosign',
  component: FormioCosign,
  decorators: [withFormik],
} satisfies Meta<typeof FormioCosign>;

type Story = StoryObj<typeof FormioCosign>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'cosign',
      type: 'cosign',
      key: 'cosign',
      label: 'Co-signer email address',
      validateOn: 'blur', // ignored but required in the types
    },
  },
  parameters: {
    formik: {
      initialValues: {
        cosign: '',
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'cosign',
      type: 'cosign',
      key: 'cosign',
      label: 'Co-signer email address',
      validateOn: 'blur', // ignored but required in the types
      tooltip: 'Surprise!',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        cosign: '',
      },
    },
  },
};

export const WithAutoComplete: Story = {
  args: {
    componentDefinition: {
      id: 'cosign',
      type: 'cosign',
      key: 'cosign',
      label: 'Co-signer email address',
      validateOn: 'blur', // ignored but required in the types
      autocomplete: 'email',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        cosign: '',
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: CosignV2ComponentSchema;
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

export const ValidateCosignFormat: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'cosign',
      type: 'cosign',
      key: 'cosign',
      label: 'Co-signer email address',
      validateOn: 'blur', // ignored but required in the types
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const cosignField = canvas.getByLabelText('Co-signer email address');
    await userEvent.type(cosignField, 'invalid');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Invalid email address.')).toBeVisible();
  },
};

export const ValidateCosignRequired: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'cosign',
      type: 'cosign',
      key: 'cosign',
      label: 'Co-signer email address',
      validateOn: 'blur', // ignored but required in the types
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const cosignField = canvas.getByLabelText('Co-signer email address');
    expect(cosignField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText('The required field Co-signer email address must be filled in.')
    ).toBeVisible();
  },
};

export const ValidateCosignRequiredWithCustomErrors: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'cosign',
      type: 'cosign',
      key: 'cosign',
      label: 'Co-signer email address',
      validateOn: 'blur', // ignored but required in the types
      validate: {
        required: true,
      },
      errors: {required: 'Custom error message for required'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Custom error message for required')).toBeVisible();
  },
};

export const PassesAllValidations: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'cosign',
      type: 'cosign',
      key: 'cosign',
      label: 'Co-signer email address',
      validateOn: 'blur', // ignored but required in the types
      validate: {
        required: true,
      },
    },
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const cosignField = canvas.getByLabelText('Co-signer email address');
    await userEvent.type(cosignField, 'info@example.com');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(args.onSubmit).toHaveBeenCalled();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: CosignV2ComponentSchema;
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

export const SingleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'cosign',
      type: 'cosign',
      key: 'cosign',
      label: 'Co-signer email address',
      validateOn: 'blur', // ignored but required in the types
    },
    value: 'openforms@example.com',
  },
};
