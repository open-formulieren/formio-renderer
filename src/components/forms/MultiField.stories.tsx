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
    renderField: ({name, label, isReadOnly}) => (
      <TextField name={name} label={label} placeholder="..." isReadOnly={isReadOnly} isMultiValue />
    ),
    label: 'Multi-value field',
    isRequired: false,
    isReadOnly: false,
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

export const ReadOnly: Story = {
  args: {
    isReadOnly: true,
  },
  parameters: {
    formik: {
      initialValues: {
        test: ['First', 'Second'],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // the add button should be visually disabled
    const addButton = canvas.getByRole('button', {name: 'Add another'});
    expect(addButton).toBeVisible();
    expect(addButton).not.toBeDisabled();
    expect(addButton).toHaveAttribute('aria-disabled', 'true');

    // remove buttons should be (visually) disabled
    const removeButtons = canvas.getAllByRole('button', {
      name: /Remove 'Multi-value field [0-9]'/,
    });
    expect(removeButtons).toHaveLength(2);
    for (const btn of removeButtons) {
      expect(btn).toBeVisible();
      expect(btn).not.toBeDisabled();
      expect(btn).toHaveAttribute('aria-disabled', 'true');
    }

    // text boxes should apply the isReadOnly (via our arg)
    const textboxes = canvas.getAllByRole('textbox');
    for (const textbox of textboxes) {
      expect(textbox).toBeVisible();
      expect(textbox).not.toBeDisabled();
      expect(textbox).toHaveAttribute('readonly');
    }
  },
};
