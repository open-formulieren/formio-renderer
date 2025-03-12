import type {Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';
import {Paragraph} from '@utrecht/component-library-react';

import {EditGridItem} from '.';

export default {
  title: 'Internal API / Forms / EditGrid / EditGridItem',
  component: EditGridItem,
  args: {
    children: <Paragraph>Any body content, typically a summary or form fields.</Paragraph>,
    heading: 'A heading for the item',
    canEdit: undefined,
    saveLabel: undefined,
    onReplace: fn(),
    canRemove: undefined,
    removeLabel: undefined,
    onRemove: fn(),
  },
  argTypes: {
    children: {control: false},
  },
} satisfies Meta<typeof EditGridItem>;

type Story = StoryObj<typeof EditGridItem>;

export const WithHeading: Story = {};

export const WithoutHeading: Story = {
  args: {
    heading: undefined,
  },
};

export const CanEdit: Story = {
  args: {
    canEdit: true,
  },
};

export const CanRemove: Story = {
  args: {
    canRemove: true,
  },
};

export const CanEditAndRemove: Story = {
  args: {
    canEdit: true,
    canRemove: true,
  },
};
