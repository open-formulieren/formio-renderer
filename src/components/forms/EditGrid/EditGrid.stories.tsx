import type {Meta, StoryObj} from '@storybook/react';
import {fn} from '@storybook/test';
import {Paragraph, PrimaryActionButton} from '@utrecht/component-library-react';

import EditGrid, {EditGridButtonGroup, EditGridItem} from '.';

export default {
  title: 'Internal API / Forms / EditGrid',
  component: EditGrid,
  args: {
    onAddItem: fn(),

    children: (
      <>
        <EditGridItem
          heading="Item 1"
          buttons={
            <EditGridButtonGroup>
              <PrimaryActionButton>A button</PrimaryActionButton>
            </EditGridButtonGroup>
          }
        >
          <Paragraph>First item</Paragraph>
        </EditGridItem>
        <EditGridItem
          heading="Item 2"
          buttons={
            <EditGridButtonGroup>
              <PrimaryActionButton>A button</PrimaryActionButton>
            </EditGridButtonGroup>
          }
        >
          <Paragraph>Second item</Paragraph>
        </EditGridItem>
      </>
    ),
  },
  argTypes: {
    children: {control: false},
  },
} satisfies Meta<typeof EditGrid>;

type Story = StoryObj<typeof EditGrid>;

export const Default: Story = {};

export const WithCustomAddButtonLabel: Story = {
  args: {
    addButtonLabel: 'Custom add button label',
  },
};

export const WithoutAddbutton: Story = {
  args: {
    onAddItem: undefined,
  },
};
