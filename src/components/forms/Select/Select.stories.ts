import type {Meta, StoryObj} from '@storybook/react';
import selectEvent from 'react-select-event';
import {expect, userEvent, waitFor, within} from 'storybook/test';
import {z} from 'zod';

import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

import Select from './Select';

export default {
  title: 'Internal API / Forms / Select',
  component: Select,
  decorators: [withFormik],
  args: {
    options: [
      {value: 'option-1', label: 'Option 1'},
      {value: 'option-2', label: 'Option 2'},
    ],
  },
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof Select>;

type Story = StoryObj<typeof Select>;

export const Default: Story = {
  args: {
    name: 'test',
    label: 'test',
    description: 'This is a custom description',
    isDisabled: false,
    isRequired: true,
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    expect(canvas.getByRole('combobox')).toBeVisible();
    expect(canvas.getByText('test')).toBeVisible();
    expect(canvas.getByText('This is a custom description')).toBeVisible();
    // Check if clicking on the label focuses the input
    const label = canvas.getByText('test');
    await userEvent.click(label);
    expect(canvas.getByRole('combobox')).toHaveFocus();
  },
};

export const SingleSelectOption: Story = {
  args: {
    name: 'test',
    label: 'test',
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await selectEvent.select(canvas.getByLabelText('test'), 'Option 1');
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(canvas.getByText('Option 1')).toBeVisible();
  },
};

export const MultipleSelectOptions: Story = {
  args: {
    name: 'test',
    label: 'test',
    isMulti: true,
  },

  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await selectEvent.select(canvas.getByLabelText('test'), 'Option 1');
    await selectEvent.select(canvas.getByLabelText('test'), 'Option 2');
    await waitFor(() => {
      expect(canvas.queryByRole('listbox')).not.toBeInTheDocument();
    });
    expect(canvas.getByText('Option 1')).toBeVisible();
    expect(canvas.getByText('Option 2')).toBeVisible();
  },
};

export const WithTooltip: Story = {
  args: {
    name: 'test',
    label: 'test',
    description: 'This is a custom description',
    isDisabled: false,
    isRequired: true,
    tooltip: 'Example short tooltip.',
  },
};
