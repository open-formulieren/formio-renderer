import type {AddressNLComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import type {FormioFormProps} from '@/components/FormioForm';
import type {FormSettings} from '@/context';
import {renderComponentInForm} from '@/registry/storybook-helpers';

import {FormioAddressNL} from './';

interface ValidationStoryArgs {
  componentDefinition: AddressNLComponentSchema;
  onSubmit: FormioFormProps['onSubmit'];
}

export default {
  title: 'Component registry / custom / addressNL / validation',
  component: FormioAddressNL,
} satisfies Meta<ValidationStoryArgs>;

type Story = StoryObj<ValidationStoryArgs>;

const BaseValidationStory: Story = {
  render: renderComponentInForm,
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const ComponentRequired: Story = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
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
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const postcodeField = canvas.getByLabelText('Postcode');
    expect(postcodeField).toBeVisible();

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('The required field Postcode must be filled in.')).toBeVisible();
    expect(
      await canvas.findByText('The required field House number must be filled in.')
    ).toBeVisible();
  },
};

export const ComponentNotRequired: Story = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      deriveAddress: false,
      layout: 'singleColumn',
      validate: {
        required: false,
      },
    } satisfies AddressNLComponentSchema,
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const postcodeField = canvas.getByLabelText('Postcode');
    expect(postcodeField).toBeVisible();
    const houseNumberField = canvas.getByLabelText('House number');
    expect(houseNumberField).toBeVisible();

    await step('Enter only postcode', async () => {
      await userEvent.type(postcodeField, '1234 AB');
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      expect(
        await canvas.findByText('The required field House number must be filled in.')
      ).toBeVisible();
    });

    await userEvent.clear(postcodeField);
    postcodeField.blur();

    await step('Enter only house number', async () => {
      await userEvent.type(houseNumberField, '333');
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      expect(
        await canvas.findByText('The required field Postcode must be filled in.')
      ).toBeVisible();
    });
  },
};

export const AutofillImpliesCityAndStreetRequired: Story = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      deriveAddress: true,
      layout: 'doubleColumn',
      validate: {
        required: false,
      },
    } satisfies AddressNLComponentSchema,
  },
  parameters: {
    formSettings: {
      componentParameters: {
        addressNL: {
          // simulate unresolved address lookup
          addressAutoComplete: async () => ({
            streetName: '',
            city: '',
            secretStreetCity: '',
          }),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const postcodeField = canvas.getByLabelText('Postcode');
    expect(postcodeField).toBeVisible();
    await userEvent.type(postcodeField, '1234 AB');

    const houseNumberField = canvas.getByLabelText('House number');
    expect(houseNumberField).toBeVisible();
    await userEvent.type(houseNumberField, '333');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(
      await canvas.findByText('The required field Street name must be filled in.')
    ).toBeVisible();
    expect(await canvas.findByText('The required field City must be filled in.')).toBeVisible();
  },
};

export const CustomPatternsAndErrorMessages: Story = {
  ...BaseValidationStory,
  args: {
    onSubmit: fn(),
    componentDefinition: {
      id: 'component1',
      type: 'addressNL',
      key: 'my.address',
      label: 'Your address',
      deriveAddress: true,
      layout: 'doubleColumn',
      validate: {
        required: false,
      },
      openForms: {
        components: {
          postcode: {
            validate: {
              pattern: '(31|32)[0-9] ?[a-zA-Z]{2}',
            },
            errors: {
              pattern: 'Postcode area must be in 31XX or 32XX.',
            },
          },
          city: {
            validate: {
              pattern: 'Utreg',
            },
            errors: {
              pattern: 'The location must be Utreg.',
            },
          },
        },
        translations: {},
      },
    } satisfies AddressNLComponentSchema,
  },
  parameters: {
    formSettings: {
      componentParameters: {
        addressNL: {
          addressAutoComplete: async () => ({
            streetName: 'Laanlaan',
            city: 'Betondam',
            secretStreetCity: 'supersecret',
          }),
        },
      } satisfies FormSettings['componentParameters'],
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const postcodeField = canvas.getByLabelText('Postcode');
    expect(postcodeField).toBeVisible();
    await userEvent.type(postcodeField, '1043 GR');

    const houseNumberField = canvas.getByLabelText('House number');
    expect(houseNumberField).toBeVisible();
    await userEvent.type(houseNumberField, '151');

    await waitFor(async () => {
      expect(canvas.getByLabelText('Street name')).toHaveDisplayValue('Laanlaan');
      expect(canvas.getByLabelText('City')).toHaveDisplayValue('Betondam');
    });

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
    expect(await canvas.findByText('Postcode area must be in 31XX or 32XX.')).toBeVisible();
    expect(await canvas.findByText('The location must be Utreg.')).toBeVisible();
  },
};
