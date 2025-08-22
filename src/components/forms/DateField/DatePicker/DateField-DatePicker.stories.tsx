import {Meta, StoryObj} from '@storybook/react-vite';

// import {within } from 'storybook/test';

import {withFormik} from '@/sb-decorators';

import DateField from '../DateField';

export default {
  title: 'Internal API / Forms / DateField / DatePicker',
  component: DateField,
  decorators: [withFormik],
  args: {
    name: 'date',
    label: 'Test date field',
    isRequired: true,
    isDisabled: false,
    description: '',
    widget: 'datePicker',
  },
  parameters: {
    formik: {
      initialValues: {
        date: '',
      },
    },
  },
  globals: {
    locale: 'nl',
  },
} satisfies Meta<typeof DateField>;

type Story = StoryObj<typeof DateField>;

export const DatePicker: Story = {
  args: {
    widget: 'datePicker',
    name: 'date',
    label: 'Date field',
    description: 'This is a custom description',
    tooltip: 'A short tooltip.',
    isDisabled: false,
    isRequired: true,
  },
  // play: async ({canvasElement}) => {
  //   const canvas = within(canvasElement);
  // },
};
