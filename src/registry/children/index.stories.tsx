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
} satisfies Meta<typeof FormioChildrenField>;

type Story = StoryObj<typeof FormioChildrenField>;

export const MinimalConfiguration: Story = {
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '111222333',
            firstNames: 'John Doe',
            dateOfBirth: '2000-1-1',
          },
        ],
      },
    },
  },
};

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
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '111222333',
            firstNames: 'John Doe',
            dateOfBirth: '2000-1-1',
          },
        ],
      },
    },
  },
};

export const WithMissingChildInformation: Story = {
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
            bsn: '111222333',
            firstNames: '',
            dateOfBirth: '',
          },
        ],
      },
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

export const ManuallyAddedChildren: Story = {
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '111222333',
            firstNames: 'John Doe',
            dateOfBirth: '2000-1-1',
            __addedManually: true,
            __id: 'e47a2ed6-1f28-46c0-b6b9-bdb6d6d1dffd',
          },
          {
            bsn: '272525108',
            firstNames: 'Billy',
            dateOfBirth: '2004-4-12',
            __addedManually: true,
            __id: '9905f081-57c2-4228-8010-77b34ef0e7ab',
          },
        ],
      },
    },
  },
};

export const ManuallyAddingChildren: Story = {
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

    await step('Add first child', async () => {
      const bsnField = canvas.getByLabelText('BSN');
      const firstNamesField = canvas.getByLabelText('Firstnames');
      const monthField = canvas.getByLabelText('Month');
      const dayField = canvas.getByLabelText('Day');
      const yearField = canvas.getByLabelText('Year');

      expect(bsnField).toBeVisible();
      expect(firstNamesField).toBeVisible();
      expect(monthField).toBeVisible();
      expect(dayField).toBeVisible();
      expect(yearField).toBeVisible();

      await userEvent.type(bsnField, '111222333');
      await userEvent.type(firstNamesField, 'John Doe');
      await userEvent.type(monthField, '10');
      await userEvent.type(dayField, '7');
      await userEvent.type(yearField, '2000');

      const submitButton = canvas.getByRole('button', {name: 'Save'});
      await userEvent.click(submitButton);
    });

    // The child details and the "add" button should both be visible
    await step('Validate manually added child', async () => {
      expect(canvas.getByText('111222333')).toBeVisible();
      expect(canvas.getByText('John Doe')).toBeVisible();
      expect(canvas.getByText('October 7, 2000')).toBeVisible();

      // We can add another child
      expect(addChildButton).toBeVisible();
    });

    // Add a second child
    await step('Add second child', async () => {
      await userEvent.click(addChildButton);

      const bsnField = canvas.getByLabelText('BSN');
      const firstNamesField = canvas.getByLabelText('Firstnames');
      const monthField = canvas.getByLabelText('Month');
      const dayField = canvas.getByLabelText('Day');
      const yearField = canvas.getByLabelText('Year');

      await userEvent.type(bsnField, '272525108');
      await userEvent.type(firstNamesField, 'Jimmy');
      await userEvent.type(monthField, '5');
      await userEvent.type(dayField, '16');
      await userEvent.type(yearField, '2003');

      const submitButton = canvas.getByRole('button', {name: 'Save'});
      await userEvent.click(submitButton);
    });

    // Both children should be visible
    await step('Validate manually added children', async () => {
      expect(canvas.getByText('111222333')).toBeVisible();
      expect(canvas.getByText('John Doe')).toBeVisible();
      expect(canvas.getByText('October 7, 2000')).toBeVisible();

      expect(canvas.getByText('272525108')).toBeVisible();
      expect(canvas.getByText('Jimmy')).toBeVisible();
      expect(canvas.getByText('May 16, 2003')).toBeVisible();
    });
  },
};

export const EditingChildDetails: Story = {
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '111222333',
            firstNames: '',
            dateOfBirth: '2000-1-1',
            __addedManually: true,
            __id: 'e47a2ed6-1f28-46c0-b6b9-bdb6d6d1dffd',
          },
        ],
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    // Find the edit button by the child's BSN, as there is no firstNames data
    const editChildButton = canvas.getByRole('button', {name: 'Edit child with BSN: 111222333'});
    expect(editChildButton).toBeVisible();
    await userEvent.click(editChildButton);

    await step('Edit child data', async () => {
      const bsnField = canvas.getByLabelText('BSN');
      const firstNamesField = canvas.getByLabelText('Firstnames');
      const monthField = canvas.getByLabelText('Month');
      const dayField = canvas.getByLabelText('Day');
      const yearField = canvas.getByLabelText('Year');

      // Expect the initial values to be set correctly
      expect(bsnField).toHaveValue('111222333');
      expect(firstNamesField).toHaveValue('');
      expect(monthField).toHaveValue('1');
      expect(dayField).toHaveValue('1');
      expect(yearField).toHaveValue('2000');

      // Update the values
      await userEvent.clear(bsnField);
      await userEvent.type(bsnField, '272525108');

      await userEvent.clear(firstNamesField);
      await userEvent.type(firstNamesField, 'Billy');

      await userEvent.clear(monthField);
      await userEvent.clear(dayField);
      await userEvent.clear(yearField);
      await userEvent.type(monthField, '4');
      await userEvent.type(dayField, '12');
      await userEvent.type(yearField, '2004');

      // Submit form
      const submitButton = canvas.getByRole('button', {name: 'Save'});
      await userEvent.click(submitButton);
    });

    await step('Expect that child data has been updated', async () => {
      // The old child data is not visible
      expect(await canvas.queryByText('111222333')).not.toBeInTheDocument();
      expect(await canvas.queryByText('John Doe')).not.toBeInTheDocument();
      expect(await canvas.queryByText('January 1, 2000')).not.toBeInTheDocument();

      // The new child data is visible
      expect(canvas.getByText('272525108')).toBeVisible();
      expect(canvas.getByText('Billy')).toBeVisible();
      expect(canvas.getByText('April 12, 2004')).toBeVisible();
    });
  },
};

export const DeletingChildDetails: Story = {
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '111222333',
            firstNames: 'John Doe',
            dateOfBirth: '2000-1-1',
            __addedManually: true,
            __id: 'e47a2ed6-1f28-46c0-b6b9-bdb6d6d1dffd',
          },
        ],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Find the delete button by the child's firstname
    const deleteChildButton = canvas.getByRole('button', {
      name: 'Delete child with firstname: John Doe',
    });
    expect(deleteChildButton).toBeVisible();

    // Delete the child
    await userEvent.click(deleteChildButton);

    // Check that the child is no longer visible
    expect(await canvas.queryByText('111222333')).not.toBeInTheDocument();
    expect(await canvas.queryByText('John Doe')).not.toBeInTheDocument();
    expect(await canvas.queryByText('January 1, 2000')).not.toBeInTheDocument();
  },
};
