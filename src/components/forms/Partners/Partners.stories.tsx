import type {Meta, StoryObj} from '@storybook/react-vite';

import {withFormik} from '@/sb-decorators';

import Partners from './Partners';

export default {
  title: 'Internal API  / Forms / Partners',
  component: Partners,
  decorators: [withFormik],
  args: {
    name: 'partners',
    label: 'Partners',
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
} satisfies Meta<typeof Partners>;

type Story = StoryObj<typeof Partners>;

export const Default: Story = {};

export const WithDescriptionAndTooltip: Story = {
  args: {
    description: 'A text describing this component',
    tooltip: 'A tooltip to provide further context',
  },
};
