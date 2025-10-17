import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, waitFor, within} from 'storybook/test';

import {TextField} from '@/components/forms';
import {withFormik} from '@/sb-decorators';

import MultiField from './MultiField';

export default {
  title: 'Internal API / Forms / MultiField',
  component: MultiField<string>,
  decorators: [withFormik],
  args: {
    name: 'test',
    newItemValue: '',
    renderField: ({name, label}) => (
      <TextField name={name} label={label} placeholder="..." isMultiValue />
    ),
    label: 'Multi-value field',
    isRequired: false,
    isDisabled: false,
    description: '',
    tooltip: '',
  },
  parameters: {
    formik: {
      initialValues: {
        test: [],
      },
    },
  },
} satisfies Meta<typeof MultiField<string>>;

type Story = StoryObj<typeof MultiField<string>>;

export const NoInitialItems: Story = {
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    // auto-add a first item
    await step('Initial item is automatically added', async () => {
      const textboxes = await canvas.findAllByRole('textbox');
      expect(textboxes).toHaveLength(1);
      expect(textboxes[0]).not.toHaveFocus();
    });

    await step('The last item can be deleted', async () => {
      const removeButton = canvas.getByRole('button', {name: /Remove/});
      await userEvent.click(removeButton);
      await waitFor(() => {
        expect(canvas.queryByRole('textbox')).not.toBeInTheDocument();
      });
    });
  },
};

export const WithValues: Story = {
  parameters: {
    formik: {
      initialValues: {
        test: ['First', 'Second'],
      },
    },
  },
};

export const WithDescriptionAndTooltip: Story = {
  args: {
    description: 'Description at the bottom',
    tooltip: 'Tooltip in the legend/label',
  },
  parameters: {
    formik: {
      initialValues: {
        test: ['First', 'Second'],
      },
    },
  },
};

export const ItemValidationError: Story = {
  parameters: {
    formik: {
      initialValues: {
        test: ['First', 'Second'],
      },
      initialTouched: {test: [true, true]},
      initialErrors: {test: ['Item 1 error', undefined]},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Item 1 error')).toBeVisible();
  },
};

export const FieldValidationError: Story = {
  parameters: {
    formik: {
      initialValues: {
        test: ['First', 'Second'],
      },
      initialTouched: {test: [true, true]},
      initialErrors: {test: 'Error about the field as a whole'},
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText('Error about the field as a whole')).toBeVisible();
  },
};

export const AddItem: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(await canvas.findAllByRole('textbox')).toHaveLength(1);

    await userEvent.click(canvas.getByRole('button', {name: 'Add another'}));
    expect(canvas.queryAllByRole('textbox')).toHaveLength(2);
    const second = canvas.queryAllByRole('textbox')[1];
    expect(second).toHaveFocus();
    await userEvent.type(second, 'First');

    await userEvent.click(canvas.getByRole('button', {name: 'Add another'}));
    expect(canvas.queryAllByRole('textbox')).toHaveLength(3);
    await userEvent.type(canvas.queryAllByRole('textbox')[2], 'Second');
  },
};

export const RemoveItem: Story = {
  parameters: {
    formik: {
      initialValues: {
        test: ['First', 'Second'],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(canvas.queryAllByRole('textbox')).toHaveLength(2);

    await userEvent.click(canvas.getByRole('button', {name: "Remove 'Multi-value field 1'"}));
    expect(canvas.queryAllByRole('textbox')).toHaveLength(1);
    expect(canvas.queryByRole('textbox')).toHaveDisplayValue('Second');
  },
};
