import type {Meta, StoryObj} from '@storybook/react-vite';

import {withFormik} from '@/sb-decorators';

import {FormioChildrenField} from './index';

export default {
  title: 'Component registry / special / children',
  component: FormioChildrenField,
  decorators: [withFormik],
  args: {
    componentDefinition: {
      id: 'children',
      type: 'children',
      key: 'children',
      label: 'Children',
      enableSelection: false,
    },
  },
} satisfies Meta<typeof FormioChildrenField>;

type Story = StoryObj<typeof FormioChildrenField>;

export const MinimalConfiguration: Story = {
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '111222333',
            firstNames: 'John Doe',
            dateOfBirth: '2000-1-1',
          },
        ],
      },
    },
  },
};

export const WithTooltipAndDescription: Story = {
  args: {
    componentDefinition: {
      id: 'children',
      type: 'children',
      key: 'children',
      label: 'Children',
      enableSelection: false,
      tooltip: 'Surprise!',
      description: 'Description as help text',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '123456789',
            firstNames: 'John Doe',
            dateOfBirth: '2000-1-1',
          },
        ],
      },
    },
  },
};

export const WithMissingChildInformation: Story = {
  args: {
    componentDefinition: {
      id: 'children',
      type: 'children',
      key: 'children',
      label: 'Children',
      enableSelection: false,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '111222333',
            firstNames: '',
            dateOfBirth: '',
          },
        ],
      },
    },
  },
};

export const NoChildrenFound: Story = {
  parameters: {
    formik: {
      initialValues: {
        children: [],
      },
    },
  },
};
