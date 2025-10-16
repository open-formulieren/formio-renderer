import type {Meta, StoryObj} from '@storybook/react-vite';
import {fn} from 'storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {getRegistryEntry} from '@/registry';
import {withFormik} from '@/sb-decorators';

import PartnerModal from './PartnerModal';

export default {
  title: 'Internal API  / Forms / Partners / Modal',
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
    isOpen: true,
    onSave: fn(),
    onClose: fn(),
    renderNested: FormioComponent,
    getRegistryEntry: getRegistryEntry,
  },
} satisfies Meta<typeof PartnerModal>;

type Story = StoryObj<typeof PartnerModal>;

export const Default: Story = {};
