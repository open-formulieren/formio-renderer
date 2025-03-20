import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from '@storybook/test';
import {z} from 'zod';

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
    label: 'Items',
    isRequired: true,
    description: 'Add as many items as you want!',
    emptyItem: {myField: ''},
    addButtonLabel: undefined,
    getItemHeading: (_, index) => `Item ${index + 1}`,
    getItemBody: (values: ItemData) => (
      <code>
        <pre style={{marginBlock: '0'}}>{JSON.stringify(values, null, 2)}</pre>
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

export const WithCustomButtonLabels: Story = {
  args: {
    enableIsolation: true,
    addButtonLabel: 'Custom add button label',
    saveItemLabel: 'Custom save item label',
    removeItemLabel: 'Custom remove item label',
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Edit item 2'}));
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
    getItemBody: (values, index, {expanded}) => (
      <>
        {expanded && <TextField name="myField" label={`My field (${index + 1})`} />}
        <span>
          Raw data:
          <code>{JSON.stringify(values)}</code>
        </span>
      </>
    ),
    getItemValidationSchema: () => {
      let fieldSchema = z.string().refine(value => value !== 'Item 1', {message: 'Nooope'});
      return z.object({myField: fieldSchema});
    },
    canRemoveItem: () => true,
    canEditItem: () => true,
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Edit item 1'}));
    const field1 = await canvas.findByLabelText('My field (1)');
    await userEvent.click(canvas.getByRole('button', {name: 'Edit item 2'}));
    const field2 = await canvas.findByLabelText('My field (2)');

    await step('Initial data display', async () => {
      expect(field1).toHaveDisplayValue('Item 1');
      expect(field2).toHaveDisplayValue('Item 2');
    });

    await step('Trigger item 1 validation', async () => {
      await userEvent.click(field1);
      await userEvent.tab();
      expect(await canvas.findByText('Nooope')).toBeVisible();
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

export const AddingItemInIsolationMode: Story = {
  args: {
    enableIsolation: true,
    getItemBody: (values, index, {expanded}) => (
      <>
        {expanded && <TextField name="myField" label={`My field (${index + 1})`} />}
        <span>
          Raw data:
          <code>{JSON.stringify(values)}</code>
        </span>
      </>
    ),
    canRemoveItem: () => true,
    emptyItem: {myField: 'new item'},
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await userEvent.click(canvas.getByRole('button', {name: 'Add another'}));
    const editButtons = canvas.queryAllByRole('button', {name: /Edit item \d/});
    expect(editButtons).toHaveLength(2); // the third one should not be visible because it must be initially expanded

    const textfield = canvas.getByLabelText('My field (3)');
    expect(textfield).toHaveDisplayValue('new item');
  },
};

export const ExternalErrorsInIsolationMode: Story = {
  args: {
    enableIsolation: true,
    getItemBody: (values, index, {expanded}) => (
      <>
        {expanded && <TextField name="myField" label={`My field (${index + 1})`} />}
        <span>
          Raw data:
          <code>{JSON.stringify(values)}</code>
        </span>
      </>
    ),
    canRemoveItem: () => true,
    emptyItem: {myField: 'new item'},
  },
  parameters: {
    formik: {
      initialErrors: {
        items: [{myField: 'Validation error 0.'}, {myField: 'Validation error 1.'}],
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    // errors must be displayed, even if that requires expanding the item automatically
    await step('Errors initially visible', async () => {
      expect(await canvas.findByText('Validation error 0.')).toBeVisible();
      expect(await canvas.findByText('Validation error 1.')).toBeVisible();
    });

    await step('Editing an item and saving it clears the errors', async () => {
      const textfield1 = canvas.getByLabelText('My field (1)');
      await userEvent.clear(textfield1);
      await userEvent.type(textfield1, 'Fixed input');
      const saveButton1 = canvas.getAllByRole('button', {name: 'Save'})[0];
      await userEvent.click(saveButton1);
      expect(textfield1).not.toBeInTheDocument();
      expect(canvas.queryByText('Validation error 0.')).not.toBeInTheDocument();
      expect(canvas.getByText('Validation error 1.')).toBeVisible();
    });

    await step('Expanding the item again does no longer displays the error', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Edit item 1'}));
      const textfield1 = canvas.getByLabelText('My field (1)');
      expect(textfield1).toBeVisible();
      expect(canvas.queryByText('Validation error 0.')).not.toBeInTheDocument();
      expect(canvas.getByText('Validation error 1.')).toBeVisible();
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
