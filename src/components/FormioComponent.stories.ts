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
