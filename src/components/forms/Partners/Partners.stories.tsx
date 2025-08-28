import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from 'storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {getRegistryEntry} from '@/registry';
import {withFormik} from '@/sb-decorators';

import Partners from './Partners';

export default {
  title: 'Internal API  / Forms / Partners',
  component: Partners,
  decorators: [withFormik],
  args: {
    name: 'partners',
    label: 'partners',
    description: 'This is a custom description for the partners field',
    renderNested: FormioComponent,
    getRegistryEntry: getRegistryEntry,
  },
  parameters: {
    formik: {
      initialValues: {
        partners: [],
      },
    },
  },
} satisfies Meta<typeof Partners>;

type Story = StoryObj<typeof Partners>;

export const Default: Story = {
  parameters: {
    formik: {
      initialValues: {
        partners: [
          {
            bsn: '123456789',
            initials: 'J',
            affixes: 'K',
            lastName: 'Boei',
            dateOfBirth: '1-1-2000',
          },
          {
            bsn: '165456987',
            initials: '',
            affixes: '',
            lastName: 'Tijest',
            dateOfBirth: '1-1-1990',
          },
        ],
      },
    },
  },
};

export const NoDataRetrieved: Story = {};

export const ManuallyAddPartner: Story = {
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    // Expect no partners
    const addPartnerButton = canvas.getByRole('button', {name: 'Add partner'});
    expect(addPartnerButton).toBeInTheDocument();

    await step('Enter partner details', async () => {
      // Open the partner modal
      await userEvent.click(addPartnerButton);

      const modal = await canvas.getByRole('dialog');
      expect(modal).toBeVisible();

      const bsnField = within(modal).getByLabelText('BSN');
      const initialsField = within(modal).getByLabelText('Initials');
      const affixesField = within(modal).getByLabelText('Affixes');
      const lastnameField = within(modal).getByLabelText('Lastname');
      const monthField = within(modal).getByLabelText('Month');
      const dayField = within(modal).getByLabelText('Day');
      const yearField = within(modal).getByLabelText('Year');

      // Fill partner fields
      await userEvent.type(bsnField, '111222333');
      await userEvent.type(initialsField, 'J');
      await userEvent.type(affixesField, 'van');
      await userEvent.type(lastnameField, 'Tol');
      await userEvent.type(monthField, '08');
      await userEvent.type(dayField, '22');
      await userEvent.type(yearField, '2000');

      // Save partner
      const saveButton = within(modal).getByRole('button', {name: 'Save'});
      await userEvent.click(saveButton);
    });

    await step('Check partner details', async () => {
      const definitions = canvas.getAllByRole('definition');

      expect(definitions).toHaveLength(5);
      expect(definitions[0]).toContainHTML('111222333');
      expect(definitions[1]).toContainHTML('J');
      expect(definitions[2]).toContainHTML('van');
      expect(definitions[3]).toContainHTML('Tol');
      expect(definitions[4]).toContainHTML('2000-08-22');
    });
  },
};

export const ManuallyEditPartner: Story = {
  parameters: {
    formik: {
      initialValues: {
        partners: [
          {
            bsn: '111222333',
            initials: 'J',
            affixes: 'van',
            lastName: 'Tol',
            dateOfBirth: '2000-08-22',
            __addedManually: true,
          },
        ],
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await step('Initial partner details should be displayed', async () => {
      const definitions = canvas.getAllByRole('definition');

      expect(definitions).toHaveLength(5);
      expect(definitions[0]).toContainHTML('111222333');
      expect(definitions[1]).toContainHTML('J');
      expect(definitions[2]).toContainHTML('van');
      expect(definitions[3]).toContainHTML('Tol');
      expect(definitions[4]).toContainHTML('2000-08-22');
    });

    await step('Update partner details', async () => {
      const editButton = canvas.getByRole('button', {name: 'Edit partner'});
      await userEvent.click(editButton);

      const modal = await canvas.getByRole('dialog');
      expect(modal).toBeVisible();

      const bsnField = within(modal).getByLabelText('BSN');
      const initialsField = within(modal).getByLabelText('Initials');
      const affixesField = within(modal).getByLabelText('Affixes');
      const lastnameField = within(modal).getByLabelText('Lastname');
      const monthField = within(modal).getByLabelText('Month');
      const dayField = within(modal).getByLabelText('Day');
      const yearField = within(modal).getByLabelText('Year');

      // Check that form fields contain the current values
      expect(bsnField).toHaveValue('111222333');
      expect(initialsField).toHaveValue('J');
      expect(affixesField).toHaveValue('van');
      expect(lastnameField).toHaveValue('Tol');
      expect(monthField).toHaveValue('8');
      expect(dayField).toHaveValue('22');
      expect(yearField).toHaveValue('2000');

      // Clear and re-fill partner fields
      await userEvent.clear(bsnField);
      await userEvent.type(bsnField, '504003938');

      await userEvent.clear(initialsField);
      await userEvent.type(initialsField, 'D');

      await userEvent.clear(affixesField);
      await userEvent.type(affixesField, 'de');

      await userEvent.clear(lastnameField);
      await userEvent.type(lastnameField, 'Vis');

      await userEvent.clear(monthField);
      await userEvent.type(monthField, '12');

      await userEvent.clear(dayField);
      await userEvent.type(dayField, '12');

      await userEvent.clear(yearField);
      await userEvent.type(yearField, '1980');

      // Save partner
      const saveButton = within(modal).getByRole('button', {name: 'Save'});
      await userEvent.click(saveButton);
    });

    await step('Updated partner details should be displayed', async () => {
      const definitions = canvas.getAllByRole('definition');

      expect(definitions).toHaveLength(5);
      expect(definitions[0]).toContainHTML('504003938');
      expect(definitions[1]).toContainHTML('D');
      expect(definitions[2]).toContainHTML('de');
      expect(definitions[3]).toContainHTML('Vis');
      expect(definitions[4]).toContainHTML('1980-12-12');
    });
  },
};
