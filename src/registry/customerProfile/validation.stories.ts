import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import selectEvent from 'react-select-event';
import {expect, fn, userEvent, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import type {FormSettings} from '@/context';
import {renderComponentInForm} from '@/registry/storybook-helpers';

import {FormioCustomerProfile} from './index';

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
          fetchDigitalAddresses: async () => [],
          portalUrl: 'https://example.com',
          updatePreferencesModalEnabled: true,
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

export const ValidateRequiredWithMultipleDigitalAddressTypes: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Submit the empty digital addresses
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const error = await canvas.findByText('At least one digital address should be provided.');
    expect(error).toBeVisible();
  },
};

export const ValidateRequiredWithOneDigitalAddressType: ValidationStory = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      type: 'customerProfile',
      key: 'customerProfile',
      id: 'customerProfile',
      label: 'Profile',
      shouldUpdateCustomerData: true,
      digitalAddressTypes: ['email'],
      validate: {
        required: true,
      },
    } satisfies CustomerProfileComponentSchema,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Submit the empty digital addresses
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    // The input should show a required error
    const error = await canvas.findByText('The required field Email must be filled in.');
    expect(error).toBeVisible();
  },
};

export const ValidateRequiredWithPrepopulatedAddressesAndMultipleDigitalAddressTypes: ValidationStory =
  {
    ...BaseValidationStory,
    parameters: {
      formik: {
        disable: true,
      },
      formSettings: {
        componentParameters: {
          customerProfile: {
            fetchDigitalAddresses: async () => [
              {type: 'email', options: ['foo@test.com', 'bar@test.com', 'baz@test.com']},
              {type: 'phoneNumber', options: ['0612345678', '0612348765']},
            ],
            portalUrl: 'https://example.com',
            updatePreferencesModalEnabled: true,
          },
        } satisfies FormSettings['componentParameters'],
      },
    },
    play: async ({canvasElement}) => {
      const canvas = within(canvasElement);

      const emailField = await canvas.findByRole('combobox', {name: 'Email'});
      const phoneNumberField = await canvas.findByRole('combobox', {name: 'Phone number'});

      // Clear both dropdowns
      // eslint-disable-next-line import/no-named-as-default-member
      await selectEvent.clearAll(emailField);
      // eslint-disable-next-line import/no-named-as-default-member
      await selectEvent.clearAll(phoneNumberField);

      // Submit the empty digital addresses
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

      const error = await canvas.findByText('At least one digital address should be provided.');
      expect(error).toBeVisible();
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

    const emailField = await canvas.findByLabelText('Email');
    const phoneNumberField = await canvas.findByLabelText('Phone number');

    await userEvent.type(emailField, 'invalid');
    await userEvent.type(phoneNumberField, 'invalid');

    // Submit the empty digital addresses
    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const emailError = await canvas.findByText('Invalid email address.');
    const phoneNumberError = await canvas.findByText(
      'Invalid phone number - a phone number may only contain digits, the + or - sign or spaces.'
    );

    expect(emailError).toBeVisible();
    expect(phoneNumberError).toBeVisible();
  },
};

export const ValidateValid: ValidationStory = {
  ...BaseValidationStory,
  play: async ({canvasElement, args}) => {
    const canvas = within(canvasElement);

    const emailField = await canvas.findByLabelText('Email');
    const phoneNumberField = await canvas.findByLabelText('Phone number');

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
