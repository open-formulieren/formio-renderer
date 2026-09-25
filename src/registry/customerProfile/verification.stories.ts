import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, waitForElementToBeRemoved, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';
import {sleep} from '@/tests/utils';

import {FormioCustomerProfile} from './index';

const defaultFormSettings: Partial<FormSettings> = {
  emailVerificationParameters: {
    requestVerificationCode: async () => {
      await sleep(100);
      return {success: true};
    },
    verifyCode: async () => {
      await sleep(100);
      return {success: true};
    },
  } satisfies FormSettings['emailVerificationParameters'],
};

export default {
  title: 'Component registry / special / profile / verification',
  component: FormioCustomerProfile,
  decorators: [withFormSettingsProvider, withFormik],
  args: {
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
    formSettings: {
      ...defaultFormSettings,
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [],
          portalUrl: 'https://example.com',
          updatePreferencesModalEnabled: true,
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
} satisfies Meta<typeof FormioCustomerProfile>;

type VerificationStory = StoryObj<typeof FormioCustomerProfile>;

export const EmtpyValue: VerificationStory = {
  parameters: {
    formik: {
      initialValues: {
        customerProfile: [],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.queryByText('Verify')).not.toBeInTheDocument();
  },
};

export const NotVerified: VerificationStory = {
  parameters: {
    formik: {
      initialValues: {
        customerProfile: [
          {
            type: 'email',
            address: 'test@mail.com',
          },
        ],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const verifyButton = await canvas.findByRole('button', {name: 'Verify'});
    await userEvent.click(verifyButton);

    expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};

export const VerificationFlow: VerificationStory = {
  parameters: {
    formSettings: {
      ...defaultFormSettings,
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {
              type: 'email',
              options: [
                {address: 'foo@test.com', isVerified: false},
                {address: 'bar@test.com', isVerified: false},
                {address: 'baz@test.com', isVerified: false},
              ],
            },
          ],
        },
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    let dialog: HTMLDialogElement;

    await step('Start verification flow', async () => {
      const verifyButton = await canvas.findByRole('button', {name: 'Verify'});
      await userEvent.click(verifyButton);

      dialog = await canvas.findByRole('dialog');
      expect(dialog).toBeVisible();
    });

    await step('Request verification code', async () => {
      await userEvent.click(
        await canvas.findByRole('radio', {name: 'Receive a verification code'})
      );
      await userEvent.click(canvas.getByRole('button', {name: 'Send code'}));

      const enterCodeInput = canvas.getByRole('radio', {name: 'Enter the verification code'});
      await waitFor(() => {
        expect(enterCodeInput).toBeChecked();
      });
    });

    await step('Enter/confirm verification code', async () => {
      const codeInput = await canvas.findByLabelText('Enter the six-character code');
      await userEvent.type(codeInput, 'abc123');
      expect(codeInput).toHaveDisplayValue('ABC123');
      await waitForElementToBeRemoved(() => {
        userEvent.click(within(dialog).getByRole('button', {name: 'Verify'}));
        return dialog;
      });
    });

    await step('Confirm verification status', async () => {
      expect(await canvas.findByText(/The email address .* is verified\./)).toBeVisible();
    });
  },
};

export const VerificationFlowWithPhoneNumber: VerificationStory = {
  parameters: {
    formSettings: {
      ...defaultFormSettings,
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {
              type: 'email',
              options: [
                {address: 'foo@test.com', isVerified: false},
                {address: 'bar@test.com', isVerified: false},
                {address: 'baz@test.com', isVerified: false},
              ],
            },
            {
              type: 'phoneNumber',
              options: [
                {address: '0612345678', isVerified: false},
                {address: '0612348765', isVerified: false},
              ],
            },
          ],
        },
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    let dialog: HTMLDialogElement;

    await step('Start verification flow', async () => {
      const verifyButton = await canvas.findByRole('button', {name: 'Verify'});
      await userEvent.click(verifyButton);

      dialog = await canvas.findByRole('dialog');
      expect(dialog).toBeVisible();
    });

    await step('Request verification code', async () => {
      await userEvent.click(
        await canvas.findByRole('radio', {name: 'Receive a verification code'})
      );
      await userEvent.click(canvas.getByRole('button', {name: 'Send code'}));

      const enterCodeInput = canvas.getByRole('radio', {name: 'Enter the verification code'});
      await waitFor(() => {
        expect(enterCodeInput).toBeChecked();
      });
    });

    await step('Enter/confirm verification code', async () => {
      const codeInput = await canvas.findByLabelText('Enter the six-character code');
      await userEvent.type(codeInput, 'abc123');
      expect(codeInput).toHaveDisplayValue('ABC123');
      await waitForElementToBeRemoved(() => {
        userEvent.click(within(dialog).getByRole('button', {name: 'Verify'}));
        return dialog;
      });
    });

    await step('Confirm verification status', async () => {
      expect(await canvas.findByText(/The email address .* is verified\./)).toBeVisible();
    });
  },
};

const BaseErrorFlowStory: VerificationStory = {
  parameters: {
    formik: {
      initialValues: {
        customerProfile: [
          {
            type: 'email',
            address: 'test@mail.com',
          },
        ],
      },
    },
    formSettings: {
      emailVerificationParameters: {
        requestVerificationCode: async () => {
          return {success: false, errorMessage: 'Simulated server error.'};
        },
        verifyCode: async () => {
          return {success: false, errors: {code: 'Simulated invalid code.'}};
        },
      } satisfies FormSettings['emailVerificationParameters'],
    },
  },
};

export const SendCodeError: VerificationStory = {
  ...BaseErrorFlowStory,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const verifyButton = await canvas.findByRole('button', {name: 'Verify'});
    await userEvent.click(verifyButton);
    const dialogNode = await canvas.findByRole<HTMLDialogElement>('dialog');
    expect(dialogNode).toBeVisible();
    const dialog = within(dialogNode);

    await userEvent.click(await dialog.findByRole('radio', {name: 'Receive a verification code'}));
    await userEvent.click(dialog.getByRole('button', {name: 'Send code'}));
    expect(await dialog.findByText('Simulated server error.')).toBeVisible();
  },
};

export const CodeVerificationError: VerificationStory = {
  ...BaseErrorFlowStory,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByRole('button', {name: 'Verify'}));
    const dialogNode = await canvas.findByRole<HTMLDialogElement>('dialog');
    expect(dialogNode).toBeVisible();
    const dialog = within(dialogNode);

    const enterCodeInput = dialog.getByRole('radio', {name: 'Enter the verification code'});
    await userEvent.click(enterCodeInput);
    expect(enterCodeInput).toBeChecked();

    const verifyButton = await dialog.findByRole('button', {name: 'Verify'});
    expect(verifyButton).toBeVisible();

    const codeInput = await dialog.findByLabelText('Enter the six-character code');
    await userEvent.type(codeInput, 'abc123');
    await userEvent.click(verifyButton);
    expect(await dialog.findByText('Simulated invalid code.')).toBeVisible();
  },
};

export const ExistingVerificationFlow: VerificationStory = {
  parameters: {
    formSettings: {
      componentParameters: {
        customerProfile: {
          fetchDigitalAddresses: async () => [
            {
              type: 'email',
              options: [
                {address: 'foo@test.com', isVerified: true},
                {address: 'bar@test.com', isVerified: false},
                {address: 'baz@test.com', isVerified: false},
              ],
            },
          ],
        },
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const emailField = await canvas.findByRole('combobox');

    expect(emailField).toHaveRole('combobox');
    // The verification modal should not be shown at this point so we can use
    // getByText here instead of qetAllByText
    expect(canvas.getByText('foo@test.com')).toBeVisible();
    expect(canvas.queryByText('You must verify this email address to continue.')).toBeNull();
    expect(await canvas.findByText(/The email address .* is verified\./)).toBeVisible();
  },
};
