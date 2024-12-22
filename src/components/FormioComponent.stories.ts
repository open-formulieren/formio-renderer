import {FieldsetComponentSchema, TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';

import FormioComponent from './FormioComponent';

export default {
  title: 'Internal API / FormioComponent',
  component: FormioComponent,
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
};

// TODO: remove story when all component types are implemented
export const UnregisteredComponent: Story = {
  args: {
    componentDefinition: {
      id: 'component-unregistered',
      type: 'cosign',
      key: 'component-unregistered',
      label: 'Unregistered component',
      validateOn: 'blur',
    },
  },
};
