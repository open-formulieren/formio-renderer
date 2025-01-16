import {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from '@storybook/test';

import {withFormik} from '@/sb-decorators';

import RadioField from './RadioField';

export default {
  title: 'Internal API / Forms / RadioField',
  component: RadioField,
  decorators: [withFormik],
  args: {
    name: 'test',
    label: 'Radio field',
    description: 'A field description',
    isDisabled: false,
    isRequired: false,
    options: [
      {value: 'sherlock', label: 'Sherlock'},
      {value: 'watson', label: 'Watson'},
      {value: 'ziggy', label: 'Ziggy'},
    ],
  },
  parameters: {
    formik: {
      initialValues: {
        test: '',
      },
    },
  },
} satisfies Meta<typeof RadioField>;

type Story = StoryObj<typeof RadioField>;

export const Default: Story = {
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const radios = canvas.getAllByRole('radio');
    await expect(radios).toHaveLength(3);

    await expect(canvas.getByText('Watson')).toBeVisible();
    await expect(canvas.getByText('A field description')).toBeVisible();

    await step('Select value', async () => {
      await userEvent.click(canvas.getByText('Ziggy'));
      await expect(radios[2]).toBeChecked();
    });
  },
};

export const ValidationError: Story = {
  name: 'Validation error',
  args: {
    name: 'radioInput',
    label: 'Radio',
    description: 'Description above the errors',
  },
  parameters: {
    formik: {
      initialValues: {
        radioInput: 'some text',
      },
      initialErrors: {
        radioInput: 'invalid',
      },
      initialTouched: {
        radioInput: true,
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('invalid')).toBeVisible();
  },
};

// export const NoAsterisks: Story = {
//   name: 'No asterisk for required',
//   decorators: [ConfigDecorator],
//   parameters: {
//     config: {
//       requiredFieldsWithAsterisk: false,
//     },
//   },
//   args: {
//     name: 'test',
//     label: 'Default required',
//     isRequired: true,
//   },
// };
