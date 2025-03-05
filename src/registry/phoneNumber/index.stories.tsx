import {PhoneNumberComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import {FormioFormProps} from '@/components/FormioForm';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {PhoneNumberField} from './';

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
