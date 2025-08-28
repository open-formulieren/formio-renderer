import type {Meta, StoryObj} from '@storybook/react';
import {fn} from 'storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {getRegistryEntry} from '@/registry';
import {withFormik} from '@/sb-decorators';

import PartnerForm from './PartnerForm';
import PartnerModal from './PartnerModal';

export default {
  title: 'Internal API  / Forms / Partners / Partner Modal',
  component: PartnerModal,
  decorators: [withFormik],
  args: {
    partnerToEdit: {
      bsn: '123456789',
      initials: 'J',
      affixes: 'K',
      lastName: 'Boei',
      dateOfBirth: '1-1-2000',
      __addedManually: true,
    },
    onSave: fn(),
    onClose: fn(),
    isOpen: true,
    renderNested: FormioComponent,
    getRegistryEntry: getRegistryEntry,
  },
} satisfies Meta<typeof PartnerModal>;

type Story = StoryObj<typeof PartnerForm>;

export const Default: Story = {};
