import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import selectEvent from 'react-select-event';
import {expect, userEvent, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioCustomerProfile} from './index';

export default {
  title: 'Component registry / special / profile / pre-populated',
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

export const WithOnePrepopulatedAddress: Story = {
  name: 'With one pre-populated address',
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
    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    // Both email and phone number fields are displayed as dropdowns
    expect(emailField).toHaveRole('combobox');
    expect(phoneNumberField).toHaveRole('combobox');

    // The fetched addresses are displayed in the dropdowns
    expect(canvas.getByText('foo@test.com')).toBeVisible();
    expect(canvas.getByText('0612345678')).toBeVisible();

    // Because only one email and phone number where returned,
    // both dropdowns should be disabled.
    expect(emailField).toBeDisabled();
    expect(phoneNumberField).toBeDisabled();
  },
};

export const WithOneEmptyAndOnePrepopulatedAddressType: Story = {
  name: 'With an empty and a pre-populated address type',
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {type: 'email', addresses: ['foo@test.com', 'bar@test.com', 'baz@test.com']},
            {type: 'phoneNumber', addresses: []},
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    // The email field is displayed as dropdown, phone number field as textfield
    expect(emailField).toHaveRole('combobox');
    expect(phoneNumberField).toHaveRole('textbox');

    // The first email address should be selected in the dropdown.
    expect(canvas.getByText('foo@test.com')).toBeVisible();
    expect(canvas.getByText('foo@test.com')).not.toHaveRole('option');
    // The phone number field should be empty.
    expect(phoneNumberField).toHaveValue('');
  },
};

export const WithPrepopulatedDigitalAddresses: Story = {
  name: 'With pre-populated addresses',
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
    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    // Both email and phone number fields are displayed as dropdowns
    expect(emailField).toHaveRole('combobox');
    expect(phoneNumberField).toHaveRole('combobox');

    // The first fetched addresses are displayed in the dropdowns.
    // Verify that we don't target combobox options.
    expect(canvas.getByText('foo@test.com')).toBeVisible();
    expect(canvas.getByText('foo@test.com')).not.toHaveRole('option');
    expect(canvas.getByText('0612345678')).toBeVisible();
    expect(canvas.getByText('0612345678')).not.toHaveRole('option');

    // Because multiple email addresses and phone numbers where returned,
    // both dropdowns are active
    expect(emailField).not.toBeDisabled();
    expect(phoneNumberField).not.toBeDisabled();
  },
};

export const WithPreferredDigitalAddresses: Story = {
  name: 'With pre-populated preferred addresses',
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
    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    // Both email and phone number fields are displayed as dropdowns
    expect(emailField).toHaveRole('combobox');
    expect(phoneNumberField).toHaveRole('combobox');

    // Both preferred addresses are selected in the dropdowns.
    // Verify that we don't target combobox options.
    expect(canvas.getByText('preferred.long.email.address@test.com')).toBeVisible();
    expect(canvas.getByText('preferred.long.email.address@test.com')).not.toHaveRole('option');
    expect(canvas.getByText('0612387645')).toBeVisible();
    expect(canvas.getByText('0612387645')).not.toHaveRole('option');

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

export const ChangeSelection: Story = {
  name: 'Change selection',
  args: {
    componentDefinition: {
      id: 'customerProfile',
      type: 'customerProfile',
      key: 'customerProfile',
      label: 'Profile',
      digitalAddressTypes: ['email'],
      shouldUpdateCustomerData: false,
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {
              type: 'email',
              addresses: ['foo@test.com', 'baz@test.com'],
            },
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');

    // The email field should be displayed as a combobox, and the first address selected
    expect(emailField).toHaveRole('combobox');
    expect(canvas.getByText('foo@test.com')).toBeVisible();
    expect(canvas.getByText('foo@test.com')).not.toHaveRole('option');

    // eslint-disable-next-line import/no-named-as-default-member
    await selectEvent.select(emailField, 'baz@test.com');
    expect(canvas.getByText('baz@test.com')).toBeVisible();
    expect(canvas.getByText('baz@test.com')).not.toHaveRole('option');
  },
};

export const AddNewAddress: Story = {
  name: 'Add new address',
  args: {
    componentDefinition: {
      id: 'customerProfile',
      type: 'customerProfile',
      key: 'customerProfile',
      label: 'Profile',
      digitalAddressTypes: ['email'],
      shouldUpdateCustomerData: false,
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {
              type: 'email',
              addresses: ['foo@test.com', 'baz@test.com'],
            },
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const emailField = canvas.getByLabelText('Email');
    // The email field should start as a combobox
    expect(emailField).toHaveRole('combobox');

    await step('Add new email address', async () => {
      // Click the "add new address" button
      await userEvent.click(canvas.getByRole('button', {name: 'Add email address'}));

      // The email field should now be a textbox
      const emailField = canvas.getByLabelText('Email');
      expect(emailField).toHaveRole('textbox');
      expect(emailField).toHaveDisplayValue('');

      // Set email address, blur to trigger validation
      await userEvent.type(emailField, 'test@mail.com');
      await emailField.blur();
    });

    await step('update preference', async () => {
      // Open preferences modal
      userEvent.click(canvas.getByRole('button', {name: 'Update preferences'}));

      const modalElement = await canvas.findByRole('dialog');
      const modal = within(modalElement);

      const forFutureUseRadio = modal.getByRole('radio', {
        name: /save my data for the future forms/i,
      });
      const oneTimeUseRadio = modal.getByRole('radio', {
        name: /Use this email address only for this form/i,
      });

      // The "use only for this form" radio button is checked
      expect(forFutureUseRadio).not.toBeChecked();
      expect(oneTimeUseRadio).toBeChecked();

      // Change preference to "save for future forms"
      await userEvent.click(forFutureUseRadio);
      expect(forFutureUseRadio).toBeChecked();
      expect(oneTimeUseRadio).not.toBeChecked();

      userEvent.click(modal.getByRole('button', {name: 'Save'}));
    });
  },
};

export const PrepopulateReturnsUnsupportedAddressTypes: Story = {
  name: 'Pre-populate returns unsupported address types',
  args: {
    componentDefinition: {
      type: 'customerProfile',
      key: 'customerProfile',
      id: 'customerProfile',
      label: 'Profile',
      shouldUpdateCustomerData: true,
      // The component only supports email addresses,
      // so we expect the pre-populate to return only email addresses.
      digitalAddressTypes: ['email'],
    } satisfies CustomerProfileComponentSchema,
  },
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          // For some reason, the pre-populate endpoint returns address types that the
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

    // Because there are no pre-populated email addresses, we show email address as textfield
    const emailField = canvas.getByLabelText('Email');

    expect(emailField).toBeVisible();
    expect(emailField).toHaveRole('textbox');

    // Because phone number isn't supported by the component, we don't show it.
    const phoneNumberField = canvas.queryByLabelText('Phone number');
    expect(phoneNumberField).not.toBeInTheDocument();
  },
};

export const LookupFailureSimulation: Story = {
  name: 'Lookup failure simulation',
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

    // If pre-populate fails, we simply show the textfields
    const emailField = canvas.getByLabelText('Email');
    const phoneNumberField = canvas.getByLabelText('Phone number');

    expect(emailField).toBeVisible();
    expect(emailField).toHaveRole('textbox');

    expect(phoneNumberField).toBeVisible();
    expect(phoneNumberField).toHaveRole('textbox');
  },
};
