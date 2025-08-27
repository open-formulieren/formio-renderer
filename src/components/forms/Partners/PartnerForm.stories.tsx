import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from 'storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {getRegistryEntry} from '@/registry';
import {withFormik} from '@/sb-decorators';

import PartnerForm from './PartnerForm';

export default {
  title: 'Internal API  / Forms / Partners / Partner Form',
  component: PartnerForm,
  decorators: [withFormik],
  args: {
    partner: {
      bsn: '',
      initials: '',
      affixes: '',
      lastName: '',
      dateOfBirth: '',
      __addedManually: true,
    },
    onSave: fn(),
    renderNested: FormioComponent,
    getRegistryEntry: getRegistryEntry,
  },
} satisfies Meta<typeof PartnerForm>;

type Story = StoryObj<typeof PartnerForm>;

export const Default: Story = {};

export const HappyFlow: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const bsnField = canvas.getByLabelText('BSN');
    const initialsField = canvas.getByLabelText('Initials');
    const affixesField = canvas.getByLabelText('Affixes');
    const lastnameField = canvas.getByLabelText('Lastname');
    const dayField = canvas.getByLabelText('Day');
    const monthField = canvas.getByLabelText('Month');
    const yearField = canvas.getByLabelText('Year');

    // All fields should be visisble
    expect(bsnField).toBeVisible();
    expect(initialsField).toBeVisible();
    expect(affixesField).toBeVisible();
    expect(lastnameField).toBeVisible();
    expect(dayField).toBeVisible();
    expect(monthField).toBeVisible();
    expect(yearField).toBeVisible();

    // Enter values
    await userEvent.type(bsnField, '123456782');
    await userEvent.type(initialsField, 'T');
    await userEvent.type(affixesField, 'de');
    await userEvent.type(lastnameField, 'Boom');
    await userEvent.type(dayField, '1');
    await userEvent.type(monthField, '1');
    await userEvent.type(yearField, '2000');

    // Inputs should contain the entered values
    expect(bsnField).toHaveValue('123456782');
    expect(initialsField).toHaveValue('T');
    expect(affixesField).toHaveValue('de');
    expect(lastnameField).toHaveValue('Boom');
    expect(dayField).toHaveValue('1');
    expect(monthField).toHaveValue('1');
    expect(yearField).toHaveValue('2000');

    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
  },
};

export const RequiredFieldsErrors: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));

    const errors = canvas.getAllByText('Required');
    expect(errors).toHaveLength(3);
  },
};
