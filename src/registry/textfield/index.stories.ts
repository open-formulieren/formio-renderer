import type {Meta, StoryObj} from '@storybook/react';

import TextField from './';

export default {
  title: 'Component registry / basic / textfield',
  component: TextField,
} satisfies Meta<typeof TextField>;

type Story = StoryObj<typeof TextField>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'textfield',
      key: 'my.textfield',
      label: 'A simple textfield',
    },
  },
};
