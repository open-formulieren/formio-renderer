import type {Decorator, Meta, StoryObj} from '@storybook/react';
import {Paragraph} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';

import {TextField} from '@/components/forms';
import {withFormik} from '@/sb-decorators';

import EditGrid from '.';

interface ItemData {
  myField: string;
}

interface StoryValues {
  items: ItemData[];
}

const withFormikValuesDisplay: Decorator = Story => {
  const {values} = useFormikContext<StoryValues>();
  return (
    <>
      <Story />
      <div style={{marginBlockStart: '10px', background: '#ececec', padding: '10px'}}>
        Formik state (values):
        <code>
          <pre>{JSON.stringify(values, null, 2)}</pre>
        </code>
      </div>
    </>
  );
};

export default {
  title: 'Internal API / Forms / EditGrid',
  component: EditGrid,
  decorators: [withFormikValuesDisplay, withFormik],
  args: {
    name: 'items',
    items: [
      {
        heading: 'Item 1',
        children: <Paragraph>First item</Paragraph>,
        canRemove: false,
      },
      {
        heading: 'Item 2',
        children: <Paragraph>Second item</Paragraph>,
        canRemove: true,
      },
    ],
    emptyItem: {myField: ''},
    addButtonLabel: undefined,
  },
  argTypes: {
    items: {control: false},
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
    items: [
      {
        heading: 'Isolation mode editing',
        children: <TextField name="myField" label="My field" />,
        canEdit: true,
        canRemove: true,
      },
    ],
    emptyItem: {myField: ''},
  },
};
