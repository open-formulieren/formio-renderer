import {Meta, StoryObj} from '@storybook/react';

import Icon from './Icon';

export default {
  title: 'Internal API / Icons',
  component: Icon,
  args: {
    className: undefined,
    'aria-hidden': true,
    'aria-label': undefined,
  },
} satisfies Meta<typeof Icon>;

type Story = StoryObj<typeof Icon>;

export const Add: Story = {
  args: {
    icon: 'add',
  },
};

export const Edit: Story = {
  args: {
    icon: 'edit',
  },
};

export const Remove: Story = {
  args: {
    icon: 'remove',
  },
};
