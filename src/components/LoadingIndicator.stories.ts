import type {Meta, StoryObj} from '@storybook/react-vite';

import LoadingIndicator from './LoadingIndicator';

export default {
  title: 'Internal API / LoadingIndicator',
  component: LoadingIndicator,
  args: {
    description: '',
    position: 'start',
    size: 'normal',
    color: 'normal',
    disableAnimation: true,
  },
  argTypes: {
    position: {
      control: 'radio',
      options: ['start', 'center', 'end'],
    },
    size: {
      control: 'radio',
      options: ['normal', 'small'],
    },
    color: {
      control: 'radio',
      options: ['normal', 'muted'],
    },
  },
} satisfies Meta<typeof LoadingIndicator>;

type Story = StoryObj<typeof LoadingIndicator>;

export const Default: Story = {
  args: {
    disableAnimation: false,
  },
  parameters: {
    chromatic: {disableSnapshot: true},
  },
};

export const DefaultNotAnimated: Story = {};

export const SmallNotAnimated: Story = {
  args: {
    size: 'small',
  },
};

export const MutedNotAnimated: Story = {
  args: {
    color: 'muted',
  },
};
