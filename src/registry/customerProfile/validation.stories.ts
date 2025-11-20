import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import type {FormSettings} from '@/context';
import {FormioCustomerProfile} from '@/registry/customerProfile/index';
import {renderComponentInForm} from '@/registry/storybook-helpers';

export default {
  title: 'Component registry / special / profile / validation',
  component: FormioCustomerProfile,
} satisfies Meta<typeof FormioCustomerProfile>;

interface ValidationStoryArgs {
  componentDefinition: CustomerProfileComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

type ValidationStory = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: ValidationStory = {
  render: renderComponentInForm,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      type: 'customerProfile',
      key: 'customerProfile',
      id: 'customerProfile',
      label: 'Profile',
      shouldUpdateCustomerData: true,
      digitalAddressTypes: ['email', 'phoneNumber'],
      validate: {
        required: true,
      },
    } satisfies CustomerProfileComponentSchema,
  },
  parameters: {
    formik: {
      disable: true,
    },
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => ({}),
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

export const ValidateRequired: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Submit the empty digital addresses
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    // All inputs should show a required error
    const errors = await canvas.findAllByText('Required');
    expect(errors).toHaveLength(2);
    for (const error of errors) {
      expect(error).toBeVisible();
    }
  },
};

// If the profile component is not required, none of its fields should be required either
export const ValidateOptional: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      type: 'customerProfile',
      key: 'customerProfile',
      id: 'customerProfile',
      label: 'Profile',
      shouldUpdateCustomerData: true,
      digitalAddressTypes: ['email', 'phoneNumber'],
      validate: {
        required: false,
      },
    } satisfies CustomerProfileComponentSchema,
  },
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    // Submit the empty digital addresses
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    // Expect form to have been submitted with empty addresses
    expect(args.onSubmit).toHaveBeenCalledWith({
      customerProfile: [
        {
          address: '',
          type: 'email',
          preferenceUpdate: 'useOnlyOnce',
        },
        {
          address: '',
          type: 'phoneNumber',
          preferenceUpdate: 'useOnlyOnce',
        },
      ],
    });
  },
};

export const ValidateInvalid: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    await userEvent.type(emailField, 'invalid');
    await userEvent.type(phoneNumberField, 'invalid');

    // Submit the empty digital addresses
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const emailError = await canvas.findByText('Invalid email address.');
    const phoneNumberError = await canvas.findByText('Invalid phone number.');

    expect(emailError).toBeVisible();
    expect(phoneNumberError).toBeVisible();
  },
};

export const ValidateValid: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    await userEvent.type(emailField, 'test@mail.com');
    await userEvent.type(phoneNumberField, '06 123 456 78');

    // Submit the empty digital addresses
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    expect(args.onSubmit).toHaveBeenCalledWith({
      customerProfile: [
        {
          address: 'test@mail.com',
          type: 'email',
          preferenceUpdate: 'useOnlyOnce',
        },
        {
          address: '06 123 456 78',
          type: 'phoneNumber',
          preferenceUpdate: 'useOnlyOnce',
        },
      ],
    });
  },
};
