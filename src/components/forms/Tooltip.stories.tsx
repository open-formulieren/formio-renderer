import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import Tooltip from './Tooltip';

export default {
  title: 'Internal API / Forms / Tooltip',
  component: Tooltip,
  args: {
    children: 'Escaped text inside the <strong>tooltip</strong>',
  },
} satisfies Meta<typeof Tooltip>;

type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {};

export const DefaultPlacement: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.keyboard('[Tab]');
    expect(
      await canvas.findByText('Escaped text inside the <strong>tooltip</strong>')
    ).toBeVisible();
  },
};

export const PlacementRight: Story = {
  ...DefaultPlacement,
  decorators: [
    Story => (
      <div style={{display: 'flex', justifyContent: 'end'}}>
        <Story />
      </div>
    ),
  ],
};
