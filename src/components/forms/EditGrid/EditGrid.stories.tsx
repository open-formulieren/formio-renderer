import type {Meta, StoryObj} from '@storybook/react';

import {TextField} from '@/components/forms';
import {withFormik} from '@/sb-decorators';

import EditGrid from '.';

interface ItemData {
  myField: string;
}

export default {
  title: 'Internal API / Forms / EditGrid',
  component: EditGrid,
  decorators: [withFormik],
  args: {
    name: 'items',
    emptyItem: {myField: ''},
    addButtonLabel: undefined,
    getItemHeading: (_, index) => `Item ${index + 1}`,
    getItemBody: values => (
      <code>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </code>
    ),
    canRemoveItem: (_, index) => index % 2 === 1,
  },
  parameters: {
    formik: {
      initialValues: {
        items: [{myField: 'Item 1'}, {myField: 'Item 2'}],
      },
    },
  },
} satisfies Meta<typeof EditGrid<ItemData>>;

type Story = StoryObj<typeof EditGrid<ItemData>>;

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

export const WithIsolation: Story = {
  args: {
    enableIsolation: true,
    getItemHeading: () => 'Isolation mode editing',
    getItemBody: () => <TextField name="myField" label="My field" />,
    canRemoveItem: () => true,
    canEditItem: () => true,
    emptyItem: {myField: ''},
  },
};
