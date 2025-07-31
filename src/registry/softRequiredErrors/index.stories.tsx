import {SoftRequiredErrorsComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';

import {SoftRequiredErrors} from '@/registry/softRequiredErrors/index';
import {withFormik} from '@/sb-decorators';

export default {
  title: 'Component registry / layout / SoftRequiredErrors',
  component: SoftRequiredErrors,
  decorators: [withFormik],
} satisfies Meta<typeof SoftRequiredErrors>;

type Story = StoryObj<typeof SoftRequiredErrors>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'softRequiredErrors',
      type: 'softRequiredErrors',
      key: 'softRequiredErrors',
      label: 'Soft required errors',
      html: `
    <p>Not all required fields are filled out. That can get expensive!</p>

    {{ missingFields }}

    <p>Are you sure you want to continue?</p>
      `,
    } satisfies SoftRequiredErrorsComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {},
    },
  },
};
