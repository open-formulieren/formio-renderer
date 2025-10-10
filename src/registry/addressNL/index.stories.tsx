import type {AddressData, AddressNLComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioAddressNL} from './';

export default {
  title: 'Component registry / custom / addressNL / presentation',
  component: FormioAddressNL,
  decorators: [withFormSettingsProvider, withFormik],
  parameters: {
    formSettings: {
      componentParameters: {
        addressNL: {
          addressAutoComplete: async () => ({
            streetName: 'Autofilled street',
            city: 'Autofilled',
            secretStreetCity: 'some-hashed-security-thing',
          }),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
} satisfies Meta<typeof FormioAddressNL>;

type Story = StoryObj<typeof FormioAddressNL>;

export const MinimalConfigurationSingleColumn: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      deriveAddress: false,
      layout: 'singleColumn',
      validate: {
        required: true,
      },
    } satisfies AddressNLComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          address: {
            postcode: '',
            houseNumber: '',
            houseLetter: '',
            houseNumberAddition: '',
            // optional properties depending on the features used
            city: undefined,
            streetName: undefined,
            secretStreetCity: undefined,
            autoPopulated: undefined,
          } satisfies AddressData,
        },
      },
    },
  },
};

export const MinimalConfigurationDoubleColumn: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      deriveAddress: false,
      layout: 'doubleColumn',
    } satisfies AddressNLComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          address: {
            postcode: '',
            houseNumber: '',
            houseLetter: '',
            houseNumberAddition: '',
            // optional properties depending on the features used
            city: undefined,
            streetName: undefined,
            secretStreetCity: undefined,
            autoPopulated: undefined,
          } satisfies AddressData,
        },
      },
    },
  },
};

export const WithDescriptionAndTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      tooltip: 'Surprise!',
      description: 'A description',
      deriveAddress: false,
      layout: 'doubleColumn',
    } satisfies AddressNLComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          address: {
            postcode: '',
            houseNumber: '',
            houseLetter: '',
            houseNumberAddition: '',
            // optional properties depending on the features used
            city: undefined,
            streetName: undefined,
            secretStreetCity: undefined,
            autoPopulated: undefined,
          } satisfies AddressData,
        },
      },
    },
  },
};

export const WithStreetAndCityFields: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      deriveAddress: true,
      layout: 'doubleColumn',
    } satisfies AddressNLComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          address: {
            postcode: '1111 AA',
            houseNumber: '101',
            houseLetter: 'L',
            houseNumberAddition: '',
            // these are merely initial defaults, the autofill mock (see parameters in
            // story meta) result in filled out values
            city: '',
            streetName: '',
            secretStreetCity: undefined,
            autoPopulated: undefined,
          } satisfies AddressData,
        },
      },
    },
  },
};

export const WithoutAsteriskForRequiredFields: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      deriveAddress: true,
      layout: 'doubleColumn',
      validate: {required: true},
    } satisfies AddressNLComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          address: {
            postcode: '',
            houseNumber: '',
            houseLetter: '',
            houseNumberAddition: '',
            // optional properties depending on the features used
            city: undefined,
            streetName: undefined,
            secretStreetCity: undefined,
            autoPopulated: undefined,
          } satisfies AddressData,
        },
      },
    },
    formSettings: {
      requiredFieldsWithAsterisk: false,
    } satisfies Partial<FormSettings>,
  },
};

export const WithoutAsteriskForRequiredFieldsAndNotRequired: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      deriveAddress: true,
      layout: 'doubleColumn',
      validate: {required: false},
    } satisfies AddressNLComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          address: {
            postcode: '',
            houseNumber: '',
            houseLetter: '',
            houseNumberAddition: '',
            // optional properties depending on the features used
            city: undefined,
            streetName: undefined,
            secretStreetCity: undefined,
            autoPopulated: undefined,
          } satisfies AddressData,
        },
      },
    },
    formSettings: {
      requiredFieldsWithAsterisk: false,
    } satisfies Partial<FormSettings>,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const notRequiredMarkers = canvas.queryAllByText(/(not required)/);
    expect(notRequiredMarkers).toHaveLength(6);

    // filling out either post code or house number makes the other field required,
    // and also the city + street name
    await userEvent.type(canvas.getByLabelText(/Postcode/), '1234 AB');

    const updatedNotRequiredMarkers = canvas.queryAllByText(/(not required)/);
    expect(updatedNotRequiredMarkers).toHaveLength(3);
  },
};
