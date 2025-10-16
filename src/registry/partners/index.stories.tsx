import type {Meta, StoryObj} from '@storybook/react-vite';

import {withFormik} from '@/sb-decorators';

import {FormioPartnersField} from './';

export default {
  title: 'Component registry / special / partners',
  component: FormioPartnersField,
  decorators: [withFormik],
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
    },
  },
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
        ],
      },
    },
  },
} satisfies Meta<typeof FormioPartnersField>;

type Story = StoryObj<typeof FormioPartnersField>;

export const MinimalConfiguration: Story = {};

export const WithTooltipAndDescription: Story = {
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
      description: 'Some extra context',
      tooltip: 'Surprise!',
    },
  },
};
