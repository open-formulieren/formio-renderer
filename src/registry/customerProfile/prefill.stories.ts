import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {rsValue} from '@/registry/storybook-helpers';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioCustomerProfile} from './index';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  title: 'Component registry / special / profile / prefill',
  component: FormioCustomerProfile,
  decorators: [withFormSettingsProvider, withFormik],
  args: {
    componentDefinition: {
      id: 'customerProfile',
      type: 'customerProfile',
      key: 'customerProfile',
      label: 'Profile',
      digitalAddressTypes: ['email', 'phoneNumber'],
      shouldUpdateCustomerData: false,
    },
  },
} satisfies Meta<typeof FormioCustomerProfile>;

type Story = StoryObj<typeof FormioCustomerProfile>;

export const WithOnePrefilledDigitalAddress: Story = {
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {type: 'email', addresses: ['foo@test.com']},
            {type: 'phoneNumber', addresses: ['0612345678']},
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    // Wait for the prefill to finish and the dropdowns to be rendered
    await sleep(100);

    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    // Wait for the prefill to finish
    await waitFor(() => {
      // Both email and phone number fields are displayed as dropdowns
      expect(emailField).toHaveRole('combobox');
      expect(phoneNumberField).toHaveRole('combobox');
    });

    // The fetched addresses are displayed in the dropdowns
    expect(rsValue(emailField)).toBe('foo@test.com');
    expect(rsValue(phoneNumberField)).toBe('0612345678');

    // Because only one email and phone number where returned,
    // both dropdowns should be disabled.
    expect(emailField).toBeDisabled();
    expect(phoneNumberField).toBeDisabled();
  },
};

export const WithPrefilledDigitalAddresses: Story = {
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {type: 'email', addresses: ['foo@test.com', 'bar@test.com', 'baz@test.com']},
            {type: 'phoneNumber', addresses: ['0612345678', '0687654321', '0612387645']},
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    // Wait for the prefill to finish and the dropdowns to be rendered
    await sleep(100);

    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    // Wait for the prefill to finish
    await waitFor(() => {
      // Both email and phone number fields are displayed as dropdowns
      expect(emailField).toHaveRole('combobox');
      expect(phoneNumberField).toHaveRole('combobox');
    });

    // The first fetched addresses are displayed in the dropdowns
    expect(rsValue(emailField)).toBe('foo@test.com');
    expect(rsValue(phoneNumberField)).toBe('0612345678');

    // Because multiple email addresses and phone numbers where returned,
    // both dropdowns are active
    expect(emailField).not.toBeDisabled();
    expect(phoneNumberField).not.toBeDisabled();
  },
};

export const WithPrefilledPreferredDigitalAddresses: Story = {
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {
              type: 'email',
              addresses: ['foo@test.com', 'preferred.long.email.address@test.com', 'baz@test.com'],
              preferred: 'preferred.long.email.address@test.com',
            },
            {
              type: 'phoneNumber',
              addresses: ['0612345678', '0687654321', '0612387645'],
              preferred: '0612387645',
            },
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement, step}) => {
    // Wait for the prefill to finish and the dropdowns to be rendered
    await sleep(100);

    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    // Both email and phone number fields are displayed as dropdowns
    expect(emailField).toHaveRole('combobox');
    expect(phoneNumberField).toHaveRole('combobox');

    // Both preferred addresses are selected in the dropdowns.
    expect(rsValue(emailField)).toBe('preferred.long.email.address@test.com');
    expect(rsValue(phoneNumberField)).toBe('0612387645');

    step('Show email addresses dropdown menu with fetched options', async () => {
      // Open email dropdown
      await userEvent.click(emailField);
      const emailDropdownMenu = within(await canvas.findByRole('listbox'));

      const allOptions = emailDropdownMenu.getAllByRole('option');
      const preferredOption = emailDropdownMenu.getByRole('option', {name: /preferred/i});

      // All fetched email addresses are displayed in the dropdown menu.
      expect(allOptions).toHaveLength(3);
      const expectedAddresses = [
        'foo@test.com',
        'preferred.long.email.address@test.com',
        'baz@test.com',
      ];
      for (const optionIndex in allOptions) {
        expect(allOptions[optionIndex]).toHaveTextContent(expectedAddresses[optionIndex]);
      }

      // The preferred address is displayed as a special option.
      expect(preferredOption).toHaveTextContent('preferred.long.email.address@test.com(Preferred)');
    });
  },
};

export const PrefillReturnsUnsupportedAddressTypes: Story = {
  args: {
    componentDefinition: {
      type: 'customerProfile',
      key: 'customerProfile',
      id: 'customerProfile',
      label: 'Profile',
      shouldUpdateCustomerData: true,
      // The component only supports email addresses,
      // so we expect the prefill to return only email addresses.
      digitalAddressTypes: ['email'],
    } satisfies CustomerProfileComponentSchema,
  },
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          // For some reason, the prefill endpoint returns address types that the
          // component doesn't support.
          fetchDigitalAddresses: async () => [
            {
              type: 'phoneNumber',
              addresses: ['06 123 456 78'],
            },
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Because there is no prefilled email addresses, we show email address as textfield
    const emailField = canvas.getByLabelText('Email');

    expect(emailField).toBeVisible();
    expect(emailField).toHaveRole('textbox');

    // Because phone number isn't supported by the component, we don't show it.
    const phoneNumberField = canvas.queryByLabelText('Phone number');
    expect(phoneNumberField).not.toBeInTheDocument();
  },
};

export const LookupFailureSimulation: Story = {
  args: {
    componentDefinition: {
      type: 'customerProfile',
      key: 'customerProfile',
      id: 'customerProfile',
      label: 'Profile',
      shouldUpdateCustomerData: true,
      digitalAddressTypes: ['email', 'phoneNumber'],
    } satisfies CustomerProfileComponentSchema,
  },
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => null,
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // If prefill fails, we simply show the textfields
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    expect(emailField).toBeVisible();
    expect(emailField).toHaveRole('textbox');

    expect(phoneNumberField).toBeVisible();
    expect(phoneNumberField).toHaveRole('textbox');
  },
};
