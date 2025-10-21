import type {PhoneNumberComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {PhoneNumberField} from './';
import ValueDisplay from './ValueDisplay';

export default {
  title: 'Component registry / basic / phoneNumber',
  component: PhoneNumberField,
  decorators: [withFormik],
} satisfies Meta<typeof PhoneNumberField>;

type Story = StoryObj<typeof PhoneNumberField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'phoneNumber',
      key: 'my.phoneNumber',
      label: 'A simple phone number',
      inputMask: null,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          phoneNumber: '',
        },
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'phoneNumber',
      key: 'phoneNumber',
      label: 'A simple phone number',
      placeholder: '123-456 789',
      inputMask: null,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        phoneNumber: '',
      },
    },
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'phoneNumber',
      key: 'phoneNumber',
      label: 'A simple phone number',
      tooltip: 'Surprise!',
      inputMask: null,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        phoneNumber: '',
      },
    },
  },
};

export const WithAutocomplete: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'phoneNumber',
      key: 'phoneNumber',
      label: 'A simple phone number',
      autocomplete: 'tel',
      inputMask: null,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        phoneNumber: '',
      },
    },
  },
};

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'phoneNumber',
      key: 'my.phoneNumber',
      label: 'A simple phone number',
      inputMask: null,
      multiple: true,
    } satisfies PhoneNumberComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          phoneNumber: ['06-12345678', '123456789'],
        },
      },
    },
  },
};

export const MultipleWithItemErrors: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'phoneNumber',
      key: 'my.phoneNumber',
      label: 'A simple phone number',
      inputMask: null,
      multiple: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          phoneNumber: ['+316 123 456 78', 'aaa-1234'],
        },
      },
      initialErrors: {
        my: {
          phoneNumber: [undefined, 'Not a valid phone number.'],
        },
      },
      initialTouched: {
        my: {
          phoneNumber: [true, true],
        },
      },
    },
  },
};

interface ValidationStoryArgs {
  componentDefinition: PhoneNumberComponentSchema;
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
      type: 'phoneNumber',
      key: 'my.phoneNumber',
      label: 'A phone number',
      inputMask: null,
      validate: {
        required: true,
      },
    } satisfies PhoneNumberComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const phoneNumberField = canvas.getByLabelText('A phone number');
    expect(phoneNumberField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Required')).toBeVisible();
  },
};

export const ValidatePattern: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'phoneNumber',
      key: 'my.phoneNumber',
      label: 'A phone number',
      inputMask: null,
      validate: {
        required: false,
      },
    } satisfies PhoneNumberComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const phoneNumberField = canvas.getByLabelText('A phone number');
    expect(phoneNumberField).toBeVisible();
    await userEvent.type(phoneNumberField, 'not-a phone number');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText(
        'Invalid phone number - a phone number may only contain digits, the + or - sign or spaces'
      )
    ).toBeVisible();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: PhoneNumberComponentSchema;
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
      type: 'phoneNumber',
      key: 'my.phoneNumber',
      label: 'A phone number',
      multiple: false,
      inputMask: null,
    } satisfies PhoneNumberComponentSchema,
    value: '06 123 456 78',
  },
};

export const MultiValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'phoneNumber',
      key: 'my.phoneNumber',
      label: 'A phone number',
      multiple: true,
      inputMask: null,
    } satisfies PhoneNumberComponentSchema,
    value: ['06 123 456 78', '+3120 123 456'],
  },
};
