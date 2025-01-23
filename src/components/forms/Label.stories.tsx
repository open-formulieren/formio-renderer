import {Meta, StoryObj} from '@storybook/react';

import Label from './Label';

export default {
  title: 'Internal API / Forms / Label',
  component: Label,
  args: {
    id: 'some-id',
    isRequired: false,
    isDisabled: false,
    children: 'My form field label',
  },
} satisfies Meta<typeof Label>;

type Story = StoryObj<typeof Label>;

export const Default: Story = {};

export const JSXLabel: Story = {
  args: {
    children: <strong>JSX label</strong>,
  },
};
