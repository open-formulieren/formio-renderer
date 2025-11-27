import type {CustomerProfileComponentSchema, CustomerProfileData} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import ValueDisplay from './ValueDisplay';
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

export const WithTooltipAndDescription: Story = {
  args: {
    componentDefinition: {
      id: 'customerProfile',
      type: 'customerProfile',
      key: 'customerProfile',
      label: 'Profile',
      tooltip: 'This is a tooltip',
      description: 'This is a description',
      digitalAddressTypes: ['email', 'phoneNumber'],
      shouldUpdateCustomerData: false,
    },
  },
};

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

export const OpenPreferencesModal: Story = {
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

// A required profile component with pre-populated addresses and multiple digital
// address types should have clearable dropdowns.
export const RequiredWithPrepopulatedAddresses: Story = {
  args: {
    componentDefinition: {
      id: 'customerProfile',
      type: 'customerProfile',
      key: 'customerProfile',
      label: 'Profile',
      digitalAddressTypes: ['email', 'phoneNumber'],
      shouldUpdateCustomerData: false,
      validate: {required: true},
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {type: 'email', addresses: ['foo@test.com', 'bar@test.com', 'baz@test.com']},
            {type: 'phoneNumber', addresses: ['0612345678', '0612387654']},
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

// A required profile component with pre-populated addresses and one digital address type
// should not have a clearable dropdown.
export const RequiredWithPrepopulatedAddressAndOneDigitalAddressType: Story = {
  args: {
    componentDefinition: {
      id: 'customerProfile',
      type: 'customerProfile',
      key: 'customerProfile',
      label: 'Profile',
      digitalAddressTypes: ['email'],
      shouldUpdateCustomerData: false,
      validate: {required: true},
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {type: 'email', addresses: ['foo@test.com', 'bar@test.com', 'baz@test.com']},
          ],
          portalUrl: 'https://example.com',
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: CustomerProfileComponentSchema;
  value: CustomerProfileData;
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

const BaseValueDisplayStory: ValueDisplayStory = {
  render: args => <ValueDisplay {...args} />,
  args: {
    componentDefinition: {
      type: 'customerProfile',
      id: 'customerProfile',
      key: 'customerProfile',
      label: 'customerProfile',
      shouldUpdateCustomerData: false,
      digitalAddressTypes: ['email', 'phoneNumber'],
    },
  },
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const SingleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [
      {
        type: 'email',
        address: 'test@mail.com',
      },
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Email label and value are shown
    const term = canvas.getByRole('term');
    const definition = canvas.getByRole('definition');

    expect(term).toBeVisible();
    expect(definition).toBeVisible();

    // Unfortunately, we cannot link the terms and definitions to each other.
    // So we have to relay on the correctness of the order.
    expect(term).toHaveTextContent('Email');
    expect(definition).toHaveTextContent('test@mail.com');
  },
};

export const MultipleValuesDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [
      {
        type: 'email',
        address: 'test@mail.com',
      },
      {
        type: 'phoneNumber',
        address: '0612345678',
      },
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // All digital addresses are shown
    const terms = canvas.getAllByRole('term');
    const definitions = canvas.getAllByRole('definition');

    expect(terms).toHaveLength(2);
    expect(definitions).toHaveLength(2);

    expect(terms[0]).toHaveTextContent('Email');
    expect(definitions[0]).toHaveTextContent('test@mail.com');

    expect(terms[1]).toHaveTextContent('Phone number');
    expect(definitions[1]).toHaveTextContent('0612345678');
  },
};

export const NoValuesDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: undefined,
  },
};

export const WithPreferencesValuesDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [
      {
        type: 'email',
        address: 'test@mail.com',
        preferenceUpdate: 'useOnlyOnce',
      },
      {
        type: 'phoneNumber',
        address: '0612345678',
        preferenceUpdate: 'isNewPreferred',
      },
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // All digital addresses are shown
    const terms = canvas.getAllByRole('term');
    const definitions = canvas.getAllByRole('definition');

    expect(terms).toHaveLength(2);
    expect(definitions).toHaveLength(2);

    // Because "use only once" doesn't affect the user's profile data,
    // we don't explicitly show that this email address is used only once.
    expect(terms[0]).toHaveTextContent('Email');
    expect(definitions[0]).toHaveTextContent('test@mail.com');

    // Marking the phone number as preferred will change the user's profile data,
    // so we highlight it here.
    expect(terms[1]).toHaveTextContent('Phone number');
    expect(definitions[1]).toHaveTextContent('0612345678 (Will become preferred phone number)');
  },
};
