import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, fn, userEvent, within} from 'storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {getRegistryEntry} from '@/registry';
import {withFormik} from '@/sb-decorators';

import PartnerForm from './PartnerForm';

export default {
  title: 'Internal API  / Forms / Partners / Form',
  component: PartnerForm,
  decorators: [withFormik],
  args: {
    partner: {
      bsn: '123456789',
      initials: 'J',
      affixes: 'K',
      lastName: 'Boei',
      dateOfBirth: '1-1-2000',
      __addedManually: true,
    },
    onSave: fn(),
    renderNested: FormioComponent,
    getRegistryEntry: getRegistryEntry,
  },
} satisfies Meta<typeof PartnerForm>;

type Story = StoryObj<typeof PartnerForm>;

export const Default: Story = {};

export const ValidationErrors: Story = {
  args: {
    partner: {
      bsn: '',
      initials: '',
      affixes: '',
      lastName: '',
      dateOfBirth: '',
      __addedManually: true,
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));

    const errors = canvas.findAllByText('Required');
    for (const error in errors) {
      expect(error).toBeVisible();
    }
  },
};
