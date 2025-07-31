import {Meta, StoryObj} from '@storybook/react-vite';
import '@utrecht/components/paragraph';

import {withFormik} from '@/sb-decorators';

import SoftRequiredErrors from './SoftRequiredErrors';

export default {
  title: 'Internal API / Forms / SoftRequiredErrors',
  component: SoftRequiredErrors,
  decorators: [withFormik],
  parameters: {
    formik: {
      disable: true,
    },
  },
  args: {
    html: `
    <p>Not all required fields are filled out. That can get expensive!</p>

    {{ missingFields }}

    <p>Are you sure you want to continue?</p>
      `,
  },
} satisfies Meta<typeof SoftRequiredErrors>;

type Story = StoryObj<typeof SoftRequiredErrors>;

export const Default: Story = {};
