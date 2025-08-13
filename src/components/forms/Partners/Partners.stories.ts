import type {Meta, StoryObj} from '@storybook/react';

import {withFormik} from '@/sb-decorators';

import Partners from './Partners';

export default {
  title: 'Internal API  / Forms / Partners',
  component: Partners,
  decorators: [withFormik],
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

export const Default: Story = {
  args: {
    name: 'partners',
    label: 'partners',
    description: 'This is a custom description for the partners field',
  },
};
