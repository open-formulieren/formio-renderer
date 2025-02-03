import {Meta, StoryObj} from '@storybook/react';
import {expect, fn, userEvent, within} from '@storybook/test';

import {withFormik} from '@/sb-decorators';

import DateField from './DateField';

export default {
  title: 'Internal API / Forms / DateField',
  component: DateField,
  decorators: [withFormik],
  args: {
    widget: 'inputGroup',
  },
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof DateField>;

type Story = StoryObj<typeof DateField>;

export const InputGroup: Story = {
  args: {
    widget: 'inputGroup',
    name: 'test',
    label: 'Test date field',
    description: 'This is a custom description',
    isDisabled: false,
    isRequired: true,
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const inputs = canvas.getAllByRole<HTMLInputElement>('textbox');
    expect(inputs).toHaveLength(3);
    await expect(canvas.getByText('Test date field')).toBeVisible();
    await expect(canvas.getByText('Year')).toBeVisible();
    await expect(canvas.getByText('Month')).toBeVisible();
    await expect(canvas.getByText('Day')).toBeVisible();
    await expect(canvas.getByText('This is a custom description')).toBeVisible();

    const inputsByName = Object.fromEntries(inputs.map(input => [input.name, input]));

    await step('Focus year', async () => {
      const yearLabel = canvas.getByText('Year');
      await userEvent.click(yearLabel);
      expect(inputsByName.year).toHaveFocus();
    });

    await step('Focus month', async () => {
      const monthLabel = canvas.getByText('Month');
      await userEvent.click(monthLabel);
      expect(inputsByName.month).toHaveFocus();
    });

    await step('Focus day', async () => {
      const dayLabel = canvas.getByText('Day');
      await userEvent.click(dayLabel);
      expect(inputsByName.day).toHaveFocus();
    });
  },
};

export const InputGroupSubmit: Story = {
  args: {
    widget: 'inputGroup',
    name: 'test',
    label: 'Test date field',
    isDisabled: false,
    isRequired: true,
  },
  decorators: [
    Story => (
      <>
        <Story />
        <button type="submit">Submit</button>
      </>
    ),
  ],
  parameters: {
    formik: {
      initialValues: {test: ''},
      onSubmit: fn(),
    },
  },

  play: async ({canvasElement, parameters}) => {
    const canvas = within(canvasElement);

    await userEvent.type(canvas.getByLabelText('Day'), '15');
    await userEvent.type(canvas.getByLabelText('Month'), '2');
    await userEvent.type(canvas.getByLabelText('Year'), '2025');

    await userEvent.click(canvas.getByRole('button', {name: 'Submit'}));

    const onSubmit = parameters.formik.onSubmit;
    expect(onSubmit).toHaveBeenCalledWith({
      test: '2025-02-15',
    });
  },
};
