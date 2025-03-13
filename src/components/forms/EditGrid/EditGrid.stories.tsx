import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from '@storybook/test';

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
    getItemBody: (values, index) => (
      <>
        <TextField name="myField" label={`My field (${index + 1})`} />
        <span>
          Raw data:
          <code>{JSON.stringify(values)}</code>
        </span>
      </>
    ),
    canRemoveItem: () => true,
    canEditItem: () => true,
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const field1 = await canvas.findByLabelText('My field (1)');
    const field2 = await canvas.findByLabelText('My field (2)');

    await step('Initial data display', () => {
      expect(field1).toHaveDisplayValue('Item 1');
      expect(field2).toHaveDisplayValue('Item 2');
    });

    await step('Edit item 2 without saving', async () => {
      await userEvent.clear(field2);
      await userEvent.type(field2, 'Updated second item');
      expect(field2).toHaveDisplayValue('Updated second item');
      expect(field1).toHaveDisplayValue('Item 1');
      expect(await canvas.findByText('{"myField":"Item 2"}')).toBeVisible();
    });

    await step('Save changes to field 2', async () => {
      const saveButtons = canvas.queryAllByRole('button', {name: 'Save'});
      await userEvent.click(saveButtons[1]);
      expect(field2).toHaveDisplayValue('Updated second item');
      expect(field1).toHaveDisplayValue('Item 1');
      expect(await canvas.findByText('{"myField":"Updated second item"}')).toBeVisible();
    });
  },
};

export const InlineEditing: Story = {
  args: {
    enableIsolation: false,
    getItemHeading: undefined,
    getItemBody: (values, index) => (
      <>
        <TextField name={`items.${index}.myField`} label={`My field (${index + 1})`} />
        <span>
          Raw data:
          <code>{JSON.stringify(values)}</code>
        </span>
      </>
    ),
    canEditItem: undefined,
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    const field1 = await canvas.findByLabelText('My field (1)');
    await userEvent.type(field1, ' updated');
    expect(await canvas.findByText('{"myField":"Item 1 updated"}')).toBeVisible();
  },
};
