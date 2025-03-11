import type {Meta, StoryObj} from '@storybook/react';
import {
  Paragraph,
  PrimaryActionButton,
  SecondaryActionButton,
} from '@utrecht/component-library-react';

import {EditGridButtonGroup, EditGridItem} from '.';

export default {
  title: 'Internal API / Forms / EditGrid / EditGridItem',
  component: EditGridItem,
  args: {
    children: <Paragraph>Any body content, typically a summary or form fields.</Paragraph>,
    heading: 'A heading for the item',
    buttons: (
      <EditGridButtonGroup>
        <PrimaryActionButton type="button">Primary</PrimaryActionButton>
        <SecondaryActionButton hint="danger">Danger</SecondaryActionButton>
      </EditGridButtonGroup>
    ),
  },
  argTypes: {
    children: {control: false},
    buttons: {control: false},
  },
} satisfies Meta<typeof EditGridItem>;

type Story = StoryObj<typeof EditGridItem>;

export const WithHeading: Story = {};

export const WithoutHeading: Story = {
  args: {
    heading: undefined,
  },
};
