import type {Meta, StoryObj} from '@storybook/react';

import FormioComponent from '@/components/FormioComponent';
import {withFormik} from '@/sb-decorators';

import Fieldset from './';

export default {
  title: 'Component registry / layout / fieldset',
  component: Fieldset,
  decorators: [withFormik],
  args: {
    renderNested: FormioComponent,
  },
} satisfies Meta<typeof Fieldset>;

type Story = StoryObj<typeof Fieldset>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'fieldset',
      key: 'fieldset',
      label: 'Fieldset label',
      hideHeader: false,
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'my.textfield',
          label: 'A simple textfield',
        },
      ],
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
