import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import {withFormik} from '@/sb-decorators';

import {FormioChildrenField} from './index';

export default {
  title: 'Component registry / special / children',
  component: FormioChildrenField,
  decorators: [withFormik],
  args: {
    componentDefinition: {
      id: 'children',
      type: 'children',
      key: 'children',
      label: 'Children',
      enableSelection: false,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '123456789',
            firstNames: 'John Doe',
            dateOfBirth: '2000-1-1',
          },
        ],
      },
    },
  },
} satisfies Meta<typeof FormioChildrenField>;

type Story = StoryObj<typeof FormioChildrenField>;

export const MinimalConfiguration: Story = {};

export const WithTooltipAndDescription: Story = {
  args: {
    componentDefinition: {
      id: 'children',
      type: 'children',
      key: 'children',
      label: 'Children',
      enableSelection: false,
      tooltip: 'Surprise!',
      description: 'Description as help text',
    },
  },
};

export const NoChildrenFound: Story = {
  parameters: {
    formik: {
      initialValues: {
        children: [],
      },
    },
  },
};

export const ManuallyAddChildren: Story = {
  parameters: {
    formik: {
      initialValues: {
        children: [],
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const addChildButton = canvas.getByRole('button', {name: 'Add child'});
    expect(addChildButton).toBeVisible();
    await userEvent.click(addChildButton);

    await step('Add child', async () => {
      const bsnField = canvas.getByLabelText('BSN');
      const firstNamesField = canvas.getByLabelText('First names');
      const monthField = canvas.getByLabelText('Month');
      const dayField = canvas.getByLabelText('Day');
      const yearField = canvas.getByLabelText('Year');

      expect(bsnField).toBeVisible();
      expect(firstNamesField).toBeVisible();
      expect(monthField).toBeVisible();
      expect(dayField).toBeVisible();
      expect(yearField).toBeVisible();

      await userEvent.type(bsnField, '123456789');
      await userEvent.type(firstNamesField, 'John Doe');
      await userEvent.type(monthField, '10');
      await userEvent.type(dayField, '7');
      await userEvent.type(yearField, '2000');

      const submitButton = canvas.getByRole('button', {name: 'Save child'});
      await userEvent.click(submitButton);
    });

    await step('Validate manually added child', async () => {
      expect(await canvas.findByText('123456789')).toBeVisible();
      expect(await canvas.findByText('John Doe')).toBeVisible();
      expect(await canvas.findByText('October 7, 2000')).toBeVisible();

      // We can add another child
      expect(addChildButton).toBeVisible();
    });
  },
};
