import type {CosignV1ComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import type {
  CosignOldParameters,
  LoginOption,
  SubmissionCoSignStatus,
} from '@/registry/cosignOld/types';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioCosignOldField as CosignField} from './';
import ValueDisplay from './ValueDisplay';

const mockGetCosignStatus = async (): Promise<SubmissionCoSignStatus> => {
  return {coSigned: false, representation: ''};
};

const getMockGetLoginOption = (
  includeLogo: boolean = false
): CosignOldParameters['getLoginOption'] => {
  return (authPlugin: string) => {
    const loginOption: LoginOption = {
      identifier: authPlugin,
      label: 'DigiD',
      url: 'https://example.com',
      isForGemachtigde: false,
    };

    if (includeLogo) {
      loginOption.logo = {
        title: 'DigiD simulatie',
        imageSrc: './img/digid.png',
        href: 'https://www.digid.nl/',
        appearance: 'dark',
      };
    }
    return loginOption;
  };
};

export default {
  title: 'Component registry / deprecated / coSign (old)',
  component: CosignField,
  decorators: [withFormSettingsProvider, withFormik],
} satisfies Meta<typeof CosignField>;

type Story = StoryObj<typeof CosignField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description!',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        coSign: {
          getCosignStatus: mockGetCosignStatus,
          getLoginOption: getMockGetLoginOption(),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('Cosign')).toBeVisible();
    expect(canvas.getByText('This is a description!')).toBeVisible();
    expect(
      await canvas.findByRole('link', {name: 'Login with DigiD'}, {timeout: 2000})
    ).toBeVisible();
  },
};

export const WithLogo: Story = {
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        coSign: {
          getCosignStatus: mockGetCosignStatus,
          getLoginOption: getMockGetLoginOption(true),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
};

export const AlreadyCosigned: Story = {
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        coSign: {
          getCosignStatus: async () => {
            return {coSigned: true, representation: 'Hans Worst'};
          },
          getLoginOption: getMockGetLoginOption(),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Hans Worst', undefined, {timeout: 2000})).toBeVisible();
  },
};

export const AlreadyCosignedWithoutRepresentation: Story = {
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        coSign: {
          getCosignStatus: async () => {
            return {coSigned: true, representation: ''};
          },
          getLoginOption: getMockGetLoginOption(),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Something went wrong while processing the co-sign results. Please contact the municipality.',
        undefined,
        {timeout: 2000}
      )
    ).toBeVisible();
  },
};

export const LoginOptionsNotAvailable: Story = {
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        coSign: {
          getCosignStatus: mockGetCosignStatus,
          getLoginOption: () => null,
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Something went wrong while presenting the login option. Please contact the municipality.',
        undefined,
        {timeout: 2000}
      )
    ).toBeVisible();
  },
};

export const RequiredCallbacksNotDefined: Story = {
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {} satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.findByText(
        'Something went wrong while presenting the login option. Please contact the municipality.',
        undefined,
        {timeout: 2000}
      )
    ).toBeVisible();
  },
};

export const AwaitingGetCosignStatus: Story = {
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        coSign: {
          getCosignStatus: async () => new Promise(() => {}),
          getLoginOption: getMockGetLoginOption(),
        },
      } satisfies FormSettings['componentParameters'],
    },
    chromatic: {disableSnapshot: true}, // don't create snapshots because of the loading spinner
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: CosignV1ComponentSchema;
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

const BaseValueDisplayStory: ValueDisplayStory = {
  render: args => <ValueDisplay {...args} />,
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const ValueDisplayCosigned: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        coSign: {
          getCosignStatus: async () => ({coSigned: true, representation: 'Hans Worst'}),
          getLoginOption: getMockGetLoginOption(),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Hans Worst', undefined, {timeout: 2000})).toBeVisible();
  },
};

export const ValueDisplayNotCosigned: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      id: 'coSign',
      type: 'coSign',
      key: 'coSign',
      label: 'Cosign',
      authPlugin: 'digid-mock',
      description: 'This is a description',
    },
  },
  parameters: {
    formSettings: {
      componentParameters: {
        coSign: {
          getCosignStatus: async () => ({coSigned: false, representation: ''}),
          getLoginOption: getMockGetLoginOption(),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    expect(await canvas.findByText('Not co-signed', undefined, {timeout: 2000})).toBeVisible();
  },
};
