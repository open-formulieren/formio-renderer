import type {Meta, StoryObj} from '@storybook/react-vite';

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
              addresses: ['foo@test.com', 'bar@test.com', 'baz@test.com'],
              preferred: 'bar@test.com',
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
};
