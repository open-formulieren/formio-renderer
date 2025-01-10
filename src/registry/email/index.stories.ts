import type {Meta, StoryObj} from '@storybook/react';

import {withFormik} from '@/sb-decorators';

import FormioEmail from './';

export default {
  title: 'Component registry / basic / email',
  component: FormioEmail,
  decorators: [withFormik],
} satisfies Meta<typeof FormioEmail>;

type Story = StoryObj<typeof FormioEmail>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'my.email',
      label: 'Your email',
      // TODO: implement!
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          email: '',
        },
      },
    },
  },
};

export const WithPlaceholder: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Your email',
      // TODO: implement!
      validateOn: 'blur',
      placeholder: 'geralt@kaer.moh.en',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
  },
};

export const WithAutoComplete: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'email',
      key: 'email',
      label: 'Your email',
      // TODO: implement!
      validateOn: 'blur',
      autocomplete: 'email',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        email: '',
      },
    },
  },
};
