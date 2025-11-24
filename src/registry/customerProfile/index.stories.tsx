import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioCustomerProfile} from './index';

export default {
  title: 'Component registry / special / profile / presentation',
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
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
} satisfies Meta<typeof FormioCustomerProfile>;

type Story = StoryObj<typeof FormioCustomerProfile>;

export const MinimalConfiguration: Story = {};

export const OnlyEmailDigitalAddressType: Story = {
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
};

export const PreferencesModal: Story = {
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
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const emailField = canvas.getByLabelText('Email');

    await step('Enter email address and open preferences modal', async () => {
      // The "update preferences" button should not yet be visible
      expect(canvas.queryByRole('button', {name: 'Update preferences'})).not.toBeInTheDocument();

      // Enter an email address
      await userEvent.type(emailField, 'test@mail.com');
      await emailField.blur();

      // The "update preferences" button should now be visible
      await userEvent.click(
        await canvas.findByRole('button', {
          name: 'Update preferences',
        })
      );
    });

    await step('In preferences modal', async () => {
      // Open preferences modal
      const modal = within(await canvas.findByRole('dialog'));
      const forFutureUseRadio = modal.getByRole('radio', {
        name: /save my data for the future forms/i,
      });
      const oneTimeUseRadio = modal.getByRole('radio', {
        name: /Use this email address only for this form/i,
      });

      // By default, the "use only for this form" radio button is checked
      expect(forFutureUseRadio).not.toBeChecked();
      expect(oneTimeUseRadio).toBeChecked();
    });
  },
};

export const WithFetchedDigitalAddresses: Story = {
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
};

export const WithPreferredDigitalAddresses: Story = {
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
  play: ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    step('Preferred addresses are selected', () => {
      const preferredEmail = canvas.getByText('preferred.long.email.address@test.com');
      const preferredPhoneNumber = canvas.getByText('0612387645');

      // Both preferred addresses are displayed
      expect(preferredEmail).toBeVisible();
      expect(preferredPhoneNumber).toBeVisible();
    });

    step('Show email addresses dropdown menu with preferred option', async () => {
      // Open email dropdown
      await userEvent.click(canvas.getByLabelText('Email'));
      const emailDropdownMenu = within(await canvas.findByRole('listbox'));

      const preferredOption = emailDropdownMenu.getByRole('option', {name: /preferred/i});

      expect(preferredOption).toHaveTextContent('preferred.long.email.address@test.com(Preferred)');
    });
  },
};

export const WithFetchedDigitalAddressesAddNewAddress: Story = {
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
              addresses: ['foo@test.com', 'preferred.long.email.address@test.com', 'baz@test.com'],
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

      const emailField = canvas.getByLabelText('Email');
      // The email field changed to an empty textbox
      expect(emailField).toHaveRole('textbox');
      expect(emailField).toHaveDisplayValue('');

      // Set email address, blur to trigger validation
      await userEvent.type(emailField, 'test@mail.com');
      await emailField.blur();
    });

    await step('update preference', async () => {
      // Open preferences modal
      userEvent.click(canvas.getByRole('button', {name: 'Update preferences'}));
      const modal = within(await canvas.findByRole('dialog'));

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

export const WithComponentValidationError: Story = {
  parameters: {
    formik: {
      initialTouched: {
        customerProfile: [{address: true}],
      },
      initialErrors: {
        customerProfile: 'Generic error message from component validation.',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Generic error message from component validation.')
    ).toBeVisible();
  },
};

export const WithDigitalAddressValidationError: Story = {
  parameters: {
    formik: {
      initialValues: {
        customerProfile: [
          {
            address: 'invalid-email',
            type: 'email',
            preferenceUpdate: 'useOnlyOnce',
          },
        ],
      },
      initialTouched: {
        customerProfile: [{address: true}],
      },
      initialErrors: {
        customerProfile: ['Generic error message from digital address validation.'],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText('Generic error message from digital address validation.')
    ).toBeVisible();
  },
};
