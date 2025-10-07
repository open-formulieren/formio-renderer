import type {FieldsetComponentSchema, TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';

import {withFormik} from '@/sb-decorators';

import FormioComponent from './FormioComponent';

export default {
  title: 'Internal API / FormioComponent',
  component: FormioComponent,
  decorators: [withFormik],
} satisfies Meta<typeof FormioComponent>;

type Story = StoryObj<typeof FormioComponent>;

export const TextField: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A simple textfield',
    } satisfies TextFieldComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: 'some initial value',
        },
      },
    },
  },
};

export const FieldSet: Story = {
  args: {
    componentDefinition: {
      id: 'component2',
      type: 'fieldset',
      key: 'fieldset',
      label: 'Fieldset label',
      hideHeader: false,
      components: [
        {
          id: 'component1',
          type: 'textfield',
          key: 'my.textfield',
          label: 'A simple textfield',
        } satisfies TextFieldComponentSchema,
      ],
    } satisfies FieldsetComponentSchema,
  },
  parameters: {
    formik: {
      initialValues: {
        my: {
          textfield: 'some initial value',
        },
      },
    },
  },
};

// TODO: remove story when all component types are implemented
export const UnregisteredComponent: Story = {
  args: {
    componentDefinition: {
      id: 'component-unregistered',
      // @ts-expect-error to avoid having to change this story everytime the specified component is
      // implemented, set it to a non-existing component type
      type: 'unregisteredComponent',
      key: 'component-unregistered',
      label: 'Unregistered component',
      validateOn: 'blur',
    },
  },
  parameters: {
    formik: {
      initialValues: {
        'component-unregistered': '',
      },
    },
  },
};
