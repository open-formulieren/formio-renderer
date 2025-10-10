import type {AddressNLComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

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
    const errors = await canvas.findAllByText('Required');
    expect(errors).toHaveLength(2);
    for (const error of errors) {
      expect(error).toBeVisible();
    }
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
      expect(await canvas.findByText('You must provide a house number.')).toBeVisible();
    });

    await userEvent.clear(postcodeField);
    postcodeField.blur();

    await step('Enter only house number', async () => {
      await userEvent.type(houseNumberField, '333');
      await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));
      expect(await canvas.findByText('You must provide a postcode.')).toBeVisible();
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
    expect(await canvas.findByText('You must provide a street name.')).toBeVisible();
    expect(await canvas.findByText('You must provide a city.')).toBeVisible();
  },
};
