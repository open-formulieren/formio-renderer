import type {AddressNLComponentSchema} from '@open-formulieren/types';
import type {AddressData} from '@open-formulieren/types/dist/components/addressNL';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import type {FormSettings} from '@/context';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import {FormioAddressNL} from './';

export default {
  title: 'Component registry / custom / addressNL / autofill',
  component: FormioAddressNL,
  decorators: [withFormSettingsProvider, withFormik],
} satisfies Meta<typeof FormioAddressNL>;

type Story = StoryObj<typeof FormioAddressNL>;

export const HappyFlow: Story = {
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
      componentParameters: {
        addressNL: {
          addressAutoComplete: async () => ({
            streetName: 'Kingsfordweg',
            city: 'Amsterdam',
            secretStreetCity: 'some-hashed-security-thing',
          }),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const postcodeField = canvas.getByLabelText('Postcode');
    expect(postcodeField).toBeVisible();
    const houseNumberField = canvas.getByLabelText('House number');
    expect(houseNumberField).toBeVisible();

    // autofilled fields
    const streetNameField = canvas.getByLabelText('Street name');
    expect(streetNameField).toBeVisible();
    const cityField = canvas.getByLabelText('City');
    expect(cityField).toBeVisible();

    await step('Verify initial state', async () => {
      expect(streetNameField).toHaveDisplayValue('');
      expect(streetNameField).toHaveAttribute('readonly');

      expect(cityField).toHaveDisplayValue('');
      expect(cityField).toHaveAttribute('readonly');
    });

    await step('Enter postcode', async () => {
      await userEvent.type(postcodeField, '1043 GR');
      postcodeField.blur();

      expect(streetNameField).toHaveDisplayValue('');
      expect(streetNameField).toHaveAttribute('readonly');
      expect(cityField).toHaveDisplayValue('');
      expect(cityField).toHaveAttribute('readonly');
    });

    await step('Enter house number', async () => {
      await userEvent.type(houseNumberField, '151');
    });

    await waitFor(async () => {
      expect(streetNameField).toHaveDisplayValue('Kingsfordweg');
      expect(cityField).toHaveDisplayValue('Amsterdam');
    });

    expect(streetNameField).toHaveAttribute('readonly');
    expect(cityField).toHaveAttribute('readonly');
  },
};

export const ModifyInputAfterAutofill: Story = {
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
      componentParameters: {
        addressNL: {
          addressAutoComplete: async () => ({
            streetName: 'Kingsfordweg',
            city: 'Amsterdam',
            secretStreetCity: 'some-hashed-security-thing',
          }),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const postcodeField = canvas.getByLabelText('Postcode');
    await userEvent.type(postcodeField, '1043 GR');
    const houseNumberField = canvas.getByLabelText('House number');
    await userEvent.type(houseNumberField, '151');

    const streetNameField = canvas.getByLabelText('Street name');
    const cityField = canvas.getByLabelText('City');

    await waitFor(async () => {
      expect(streetNameField).toHaveDisplayValue('Kingsfordweg');
      expect(cityField).toHaveDisplayValue('Amsterdam');
    });

    await step('Clearing source data clears derived data', async () => {
      await userEvent.clear(postcodeField);

      await waitFor(async () => {
        expect(streetNameField).toHaveDisplayValue('');
        expect(cityField).toHaveDisplayValue('');
      });

      expect(streetNameField).toHaveAttribute('readonly');
      expect(cityField).toHaveAttribute('readonly');
    });
  },
};

export const AddressDoesNotResolve: Story = {
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
      componentParameters: {
        addressNL: {
          addressAutoComplete: async () => ({
            streetName: '',
            city: '',
            secretStreetCity: '',
          }),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const postcodeField = canvas.getByLabelText('Postcode');
    expect(postcodeField).toBeVisible();
    const houseNumberField = canvas.getByLabelText('House number');
    expect(houseNumberField).toBeVisible();

    // autofilled fields
    const streetNameField = canvas.getByLabelText('Street name');
    expect(streetNameField).toBeVisible();
    const cityField = canvas.getByLabelText('City');
    expect(cityField).toBeVisible();

    await step('Verify initial state', async () => {
      expect(streetNameField).toHaveDisplayValue('');
      expect(streetNameField).toHaveAttribute('readonly');

      expect(cityField).toHaveDisplayValue('');
      expect(cityField).toHaveAttribute('readonly');
    });

    await step('Enter bad postcode and house number', async () => {
      await userEvent.type(postcodeField, '9999 ZZ');
      await userEvent.type(houseNumberField, '99999');

      expect(streetNameField).toHaveDisplayValue('');
      expect(streetNameField).toHaveAttribute('readonly');
      expect(cityField).toHaveDisplayValue('');
      expect(cityField).toHaveAttribute('readonly');
    });
  },
};

export const LookupFailureSimulation: Story = {
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
      componentParameters: {
        addressNL: {
          addressAutoComplete: async () => null,
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const postcodeField = canvas.getByLabelText('Postcode');
    expect(postcodeField).toBeVisible();
    const houseNumberField = canvas.getByLabelText('House number');
    expect(houseNumberField).toBeVisible();

    // autofilled fields
    const streetNameField = canvas.getByLabelText('Street name');
    expect(streetNameField).toBeVisible();
    const cityField = canvas.getByLabelText('City');
    expect(cityField).toBeVisible();

    await step('Verify initial state', async () => {
      expect(streetNameField).toHaveDisplayValue('');
      expect(streetNameField).toHaveAttribute('readonly');

      expect(cityField).toHaveDisplayValue('');
      expect(cityField).toHaveAttribute('readonly');
    });

    await step('Enter postcode', async () => {
      await userEvent.type(postcodeField, '1043 GR');
      postcodeField.blur();

      expect(streetNameField).toHaveDisplayValue('');
      expect(streetNameField).toHaveAttribute('readonly');
      expect(cityField).toHaveDisplayValue('');
      expect(cityField).toHaveAttribute('readonly');
    });

    await step('Enter house number', async () => {
      await userEvent.type(houseNumberField, '151');

      await waitFor(async () => {
        expect(streetNameField).not.toHaveAttribute('readonly');
        expect(cityField).not.toHaveAttribute('readonly');
      });
    });

    await step('Manually fill out street and city', async () => {
      await userEvent.type(streetNameField, 'Totally real street');
      await userEvent.type(cityField, 'Not-Fake Town');
    });

    await step('Modifying input field does not clear manually filled out fields', async () => {
      await userEvent.type(postcodeField, '[Backspace]');
      // type in another field to give time to update...
      await userEvent.type(canvas.getByLabelText('House letter'), 'Z', {delay: 100});

      expect(cityField).toHaveDisplayValue('Not-Fake Town');
    });
  },
};
