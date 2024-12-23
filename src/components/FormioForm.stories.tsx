import {TextFieldComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';

import FormioForm from './FormioForm';

export default {
  title: 'Public API / FormioForm',
  component: FormioForm,
  args: {
    onSubmit: fn(),
    children: (
      <div style={{marginBlockStart: '20px'}}>
        <button type="submit">Submit</button>
      </div>
    ),
  },
  argTypes: {
    children: {
      table: {
        disable: true,
      },
    },
  },
  tags: ['unstable', '!private', 'public'],
} satisfies Meta<typeof FormioForm>;

type Story = StoryObj<typeof FormioForm>;

export const FlatLayout: Story = {
  args: {
    components: [
      {
        id: 'component1',
        type: 'textfield',
        key: 'nested.textfield',
        label: 'Text field 1',
      } satisfies TextFieldComponentSchema,
      {
        id: 'component2',
        type: 'textfield',
        key: 'topLevelTextfield',
        label: 'Text field 2',
        defaultValue: 'Default/initial value',
      } satisfies TextFieldComponentSchema,
    ],
  },
};
