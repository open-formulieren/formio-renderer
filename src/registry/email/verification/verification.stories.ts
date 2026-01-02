import type {EditGridComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, waitForElementToBeRemoved, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import type {FormSettings} from '@/context';
import {renderComponentInForm} from '@/registry/storybook-helpers';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';
import type {JSONObject} from '@/types';

import {FormioEmail} from '../';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export default {
  title: 'Component registry / basic / email / verification',
  component: FormioEmail,
  decorators: [withFormSettingsProvider, withFormik],
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Email with verification requirement',
      openForms: {
        requireVerification: true,
        translations: {},
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
    formSettings: {
      componentParameters: {
        email: {
          requestVerificationCode: async () => {
            await sleep(100);
            return {success: true};
          },
          verifyCode: async () => {
            await sleep(100);
            return {success: true};
          },
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
} satisfies Meta<typeof FormioEmail>;

type Story = StoryObj<typeof FormioEmail>;

export const EmptyValue: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Empty value',
      openForms: {
        requireVerification: true,
        translations: {},
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
  },
};

export const NotVerified: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Email with verification requirement',
      openForms: {
        requireVerification: true,
        translations: {},
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: 'unverified@example.com',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Verify'}));

    expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};

export const VerificationFlow: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Email with verification requirement',
      openForms: {
        requireVerification: true,
        translations: {},
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: 'unverified@example.com',
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    let dialog: HTMLDialogElement;

    await step('Start verification flow', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Verify'}));

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

const BaseErrorFlowStory: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Email with verification requirement',
      openForms: {
        requireVerification: true,
        translations: {},
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: 'unverified@example.com',
      },
    },
    formSettings: {
      componentParameters: {
        email: {
          requestVerificationCode: async () => {
            return {success: false, errorMessage: 'Simulated server error.'};
          },
          verifyCode: async () => {
            return {success: false, errors: {code: 'Simulated invalid code.'}};
          },
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

export const SendCodeError: Story = {
  ...BaseErrorFlowStory,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {name: 'Verify'}));
    const dialogNode = await canvas.findByRole<HTMLDialogElement>('dialog');
    expect(dialogNode).toBeVisible();
    const dialog = within(dialogNode);

    await userEvent.click(await dialog.findByRole('radio', {name: 'Receive a verification code'}));
    await userEvent.click(dialog.getByRole('button', {name: 'Send code'}));
    expect(await dialog.findByText('Simulated server error.')).toBeVisible();
  },
};

export const CodeVerificationError: Story = {
  ...BaseErrorFlowStory,
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Verify'}));
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

export const Multiple: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Email with verification requirement',
      multiple: true,
      openForms: {
        requireVerification: true,
        translations: {},
      },
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: ['verified@example.com', 'unverified@example.com'],
      },
      initialStatus: {
        emailVerification: {
          email: {
            'verified@example.com': true,
          },
        },
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Verify'}));

    expect(await canvas.findByRole('dialog')).toBeVisible();
  },
};

interface InEditGridArgs {
  componentDefinition: EditGridComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
  values: JSONObject;
}

export const InEditGrid: StoryObj<InEditGridArgs> = {
  render: renderComponentInForm,
  parameters: {
    formik: {
      disable: true,
    },
  },
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'editgrid',
      type: 'editgrid',
      key: 'editgrid',
      label: 'Edit grid',
      groupLabel: 'Email',
      disableAddingRemovingRows: true,
      components: [
        {
          id: 'component1',
          type: 'email',
          key: 'email',
          label: 'Email with verification requirement',
          openForms: {
            requireVerification: true,
            translations: {},
          },
        },
      ],
    },
    values: {
      editgrid: [{email: 'unverified@example.com'}, {email: 'verified@example.com'}],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: /Edit item 1/}));
    await userEvent.click(canvas.getByRole('button', {name: /Edit item 2/}));

    const item2 = within(canvas.getAllByRole('listitem')[1]);

    await userEvent.click(item2.getByRole('button', {name: 'Verify'}));
    const dialogNode = await canvas.findByRole('dialog');
    expect(dialogNode).toBeVisible();
    const dialog = within(dialogNode);

    const receiveCodeInput = await dialog.findByRole('radio', {
      name: 'Receive a verification code',
    });
    expect(receiveCodeInput).toBeChecked();

    await userEvent.click(dialog.getByRole('button', {name: 'Send code'}));
    const verifyCodeInput = dialog.getByRole('radio', {name: 'Enter the verification code'});
    await waitFor(() => {
      expect(verifyCodeInput).toBeChecked();
    });
    await userEvent.type(dialog.getByLabelText('Enter the six-character code'), 'H4CK3R');
    await waitForElementToBeRemoved(() => {
      userEvent.click(dialog.getByRole('button', {name: 'Verify'}));
      return dialogNode;
    });

    expect(await item2.findByText(/The email address .* is verified\./)).toBeVisible();
  },
};
