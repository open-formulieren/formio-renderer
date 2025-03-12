import type {Meta, StoryObj} from '@storybook/react';
import {Paragraph} from '@utrecht/component-library-react';

import {withFormik} from '@/sb-decorators';

import EditGrid from '.';

export default {
  title: 'Internal API / Forms / EditGrid',
  component: EditGrid,
  decorators: [withFormik],
  args: {
    name: 'items',
    items: [
      {
        heading: 'Item 1',
        children: <Paragraph>First item</Paragraph>,
        // TODO: should we just do inline edits, or keep the explicit edit/confirm?
        canEdit: true,
        canRemove: false,
      },
      {
        heading: 'Item 2',
        children: <Paragraph>Second item</Paragraph>,
        // TODO: should we just do inline edits, or keep the explicit edit/confirm?
        canEdit: true,
        canRemove: true,
      },
    ],
    emptyItem: {} as const,
    addButtonLabel: undefined,
  },
  argTypes: {
    items: {control: false},
  },
  parameters: {
    formik: {
      initialValues: {
        items: [{}, {}],
      },
    },
  },
} satisfies Meta<typeof EditGrid>;

type Story = StoryObj<typeof EditGrid>;

export const Default: Story = {};

export const WithCustomAddButtonLabel: Story = {
  args: {
    addButtonLabel: 'Custom add button label',
  },
};

export const WithoutAddButton: Story = {
  args: {
    emptyItem: null,
  },
};
