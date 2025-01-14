import type {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import FormioForm, {FormioFormProps} from '@/components/FormioForm';
import {withFormik} from '@/sb-decorators';

import RadioField from './';
import type {RadioComponentSchema} from './types';

export default {
  title: 'Component registry / basic / radio',
  component: RadioField,
  decorators: [withFormik],
} satisfies Meta<typeof RadioField>;

type Story = StoryObj<typeof RadioField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'radio',
      key: 'my.radio',
      label: 'A radio choice',
      values: [
        {
          value: 'referenceLists',
          label: 'Reference lists',
        },
        {
          value: 'formVariable',
          label: 'Form variable',
        },
      ],
      defaultValue: null,
    } satisfies RadioComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          radio: null,
        },
      },
    },
  },
};
