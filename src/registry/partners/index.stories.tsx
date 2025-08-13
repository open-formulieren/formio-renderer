import type {Meta, StoryObj} from '@storybook/react-vite';

import {withFormik} from '@/sb-decorators';

import {PartnersField} from './';

export default {
  title: 'Component registry / special / partners',
  component: PartnersField,
  decorators: [withFormik],
} satisfies Meta<typeof PartnersField>;

type Story = StoryObj<typeof PartnersField>;

export const MinimalConfiguration: Story = {
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
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'partners',
      type: 'partners',
      key: 'partners',
      label: 'Partners',
      tooltip: 'Surprise!',
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
};
