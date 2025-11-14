import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

import {Button, PrimaryActionButton, SecondaryActionButton, SubtleButton} from './Button';

export default {
  title: 'Internal API / Button',
  component: Button,
  args: {
    children: 'Button text',
  },
} satisfies Meta<typeof Button>;

type Story = StoryObj<typeof Button>;

export const Default: Story = {};

export const Primary: StoryObj<typeof PrimaryActionButton> = {
  render: args => {
    return <PrimaryActionButton {...args} />;
  },
};

export const PrimaryDisabled: StoryObj<typeof PrimaryActionButton> = {
  render: args => {
    return <PrimaryActionButton {...args} />;
  },
  args: {
    disabled: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button');
    expect(button).not.toBeDisabled();
    expect(button).toHaveAttribute('aria-disabled', 'true');
  },
};

export const Secondary: StoryObj<typeof SecondaryActionButton> = {
  render: args => {
    return <SecondaryActionButton {...args} />;
  },
};

export const Subtle: StoryObj<typeof SubtleButton> = {
  render: args => {
    return <SubtleButton {...args} />;
  },
};
