import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioCustomerProfile} from './index';

export default {
  title: 'Component registry / special / profile',
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
          fetchDigitalAddresses: async () => ({}),
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

export const WithFetchedDigitalAddresses: Story = {
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => ({
            email: {addresses: ['foo@test.com', 'bar@test.com', 'baz@test.com']},
            phoneNumber: {addresses: ['0612345678', '0687654321', '0612387645']},
          }),
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
          fetchDigitalAddresses: async () => ({
            email: {
              addresses: ['foo@test.com', 'preferred.long.email.address@test.com', 'baz@test.com'],
              preferred: 'preferred.long.email.address@test.com',
            },
            phoneNumber: {
              addresses: ['0612345678', '0687654321', '0612387645'],
              preferred: '0612387645',
            },
          }),
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
