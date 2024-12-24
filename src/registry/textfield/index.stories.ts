import type {Meta, StoryObj} from '@storybook/react';

import {withFormik} from '@/sb-decorators';

import TextField from './';

export default {
  title: 'Component registry / basic / textfield',
  component: TextField,
  decorators: [withFormik],
} satisfies Meta<typeof TextField>;

type Story = StoryObj<typeof TextField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A simple textfield',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: '',
        },
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'textfield',
      label: 'A simple textfield',
      placeholder: 'Ada',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        textfield: '',
      },
    },
  },
};
