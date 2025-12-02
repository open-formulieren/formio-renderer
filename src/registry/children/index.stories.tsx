import type {ChildrenComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import {withFormik} from '@/sb-decorators';

import ValueDisplay from './ValueDisplay';
import {FormioChildrenField} from './index';
import type {ExtendedChildDetails} from './types';

export default {
  title: 'Component registry / special / children / presentation',
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

export const WithSelectionEnabled: Story = {
  args: {
    componentDefinition: {
      id: 'children',
      type: 'children',
      key: 'children',
      label: 'Children',
      enableSelection: true,
    },
  },
  parameters: {
    formik: {
      initialValues: {
        children: [
          {
            bsn: '123456789',
            firstNames: 'John',
            dateOfBirth: '2000-1-1',
            selected: false,
          },
          {
            bsn: '074303909',
            firstNames: 'Jane',
            dateOfBirth: '1997-12-12',
            selected: false,
          },
          {
            bsn: '111222333',
            firstNames: 'Jimmy',
            dateOfBirth: '1995-4-3',
            _OF_INTERNAL_addedManually: true,
            _OF_INTERNAL_id: 'e47a2ed6-1f28-46c0-b6b9-bdb6d6d1dffd',
            selected: true,
          },
        ],
      },
    },
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await step('Validate initial state', () => {
      const johnCheckbox = canvas.getByRole('checkbox', {name: 'Include John?'});
      const janeCheckbox = canvas.getByRole('checkbox', {name: 'Include Jane?'});
      const jimmyCheckbox = canvas.getByRole('checkbox', {name: 'Include Jimmy?'});

      // All "select child" checkboxes should be visible
      expect(johnCheckbox).toBeVisible();
      expect(janeCheckbox).toBeVisible();
      expect(jimmyCheckbox).toBeVisible();

      // Only the selected child should be checked
      expect(johnCheckbox).not.toBeChecked();
      expect(janeCheckbox).not.toBeChecked();
      expect(jimmyCheckbox).toBeChecked();
    });

    await step('Check the "include Jane" checkbox', async () => {
      const checkbox = canvas.getByRole('checkbox', {name: 'Include Jane?'});
      expect(checkbox).not.toBeChecked();

      await userEvent.click(checkbox);
      expect(checkbox).toBeChecked();
    });
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
            _OF_INTERNAL_addedManually: true,
            _OF_INTERNAL_id: 'e47a2ed6-1f28-46c0-b6b9-bdb6d6d1dffd',
          },
          {
            bsn: '272525108',
            firstNames: 'Billy',
            dateOfBirth: '2004-4-12',
            _OF_INTERNAL_addedManually: true,
            _OF_INTERNAL_id: '9905f081-57c2-4228-8010-77b34ef0e7ab',
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
      const modal = within(await canvas.findByRole('dialog'));

      const bsnField = modal.getByLabelText('BSN');
      const firstNamesField = modal.getByLabelText('Firstnames');
      const monthField = modal.getByLabelText('Month');
      const dayField = modal.getByLabelText('Day');
      const yearField = modal.getByLabelText('Year');

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

      const submitButton = modal.getByRole('button', {name: 'Save'});
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

      const modal = within(await canvas.findByRole('dialog'));

      const bsnField = modal.getByLabelText('BSN');
      const firstNamesField = modal.getByLabelText('Firstnames');
      const monthField = modal.getByLabelText('Month');
      const dayField = modal.getByLabelText('Day');
      const yearField = modal.getByLabelText('Year');

      await userEvent.type(bsnField, '272525108');
      await userEvent.type(firstNamesField, 'Jimmy');
      await userEvent.type(monthField, '5');
      await userEvent.type(dayField, '16');
      await userEvent.type(yearField, '2003');

      const submitButton = modal.getByRole('button', {name: 'Save'});
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
            _OF_INTERNAL_addedManually: true,
            _OF_INTERNAL_id: 'e47a2ed6-1f28-46c0-b6b9-bdb6d6d1dffd',
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
      expect(canvas.queryByText('111222333')).not.toBeInTheDocument();
      expect(canvas.queryByText('John Doe')).not.toBeInTheDocument();
      expect(canvas.queryByText('January 1, 2000')).not.toBeInTheDocument();

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
            _OF_INTERNAL_addedManually: true,
            _OF_INTERNAL_id: 'e47a2ed6-1f28-46c0-b6b9-bdb6d6d1dffd',
          },
        ],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    // Find the delete button by the child's firstname
    const deleteChildButton = canvas.getByRole('button', {
      name: 'Delete child with first name: John Doe',
    });
    expect(deleteChildButton).toBeVisible();

    // Delete the child
    await userEvent.click(deleteChildButton);

    // Check that the child is no longer visible
    expect(canvas.queryByText('111222333')).not.toBeInTheDocument();
    expect(canvas.queryByText('John Doe')).not.toBeInTheDocument();
    expect(canvas.queryByText('January 1, 2000')).not.toBeInTheDocument();
  },
};

interface ValueDisplayStoryArgs {
  componentDefinition: ChildrenComponentSchema;
  value: ExtendedChildDetails[];
}

type ValueDisplayStory = StoryObj<ValueDisplayStoryArgs>;

const BaseValueDisplayStory: ValueDisplayStory = {
  render: args => <ValueDisplay {...args} />,
  args: {
    componentDefinition: {
      type: 'children',
      key: 'children',
      id: 'children',
      label: 'Children',
      enableSelection: false,
    } satisfies ChildrenComponentSchema,
  },
  parameters: {
    formik: {
      disable: true,
    },
  },
};

export const SingleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [
      {
        bsn: '111222333',
        firstNames: 'Joe B',
        dateOfBirth: '1980-5-20',
      },
    ] satisfies ExtendedChildDetails[],
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const terms = canvas.getAllByRole('term');
    const definitions = canvas.getAllByRole('definition');

    expect(terms).toHaveLength(3);
    expect(definitions).toHaveLength(3);

    // Unfortunately, we cannot link the terms and definitions to each other.
    // So we have to relay on the correctness of the order.
    step('check term and definition values', () => {
      expect(terms[0]).toHaveTextContent('BSN');
      expect(definitions[0]).toHaveTextContent('111222333');

      expect(terms[1]).toHaveTextContent('Firstnames');
      expect(definitions[1]).toHaveTextContent('Joe B');

      expect(terms[2]).toHaveTextContent('Date of birth');
      expect(definitions[2]).toHaveTextContent('May 20, 1980');
    });
  },
};

export const MultipleValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    value: [
      {
        bsn: '111222333',
        firstNames: 'Joe B',
        dateOfBirth: '1980-5-20',
      },
      {
        bsn: '923456788',
        firstNames: 'Tom Sawyer',
        dateOfBirth: '1988-7-14',
      },
    ] satisfies ExtendedChildDetails[],
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const terms = canvas.getAllByRole('term');
    const definitions = canvas.getAllByRole('definition');

    expect(terms).toHaveLength(6);
    expect(definitions).toHaveLength(6);

    // The order of the terms is validated in the previous test.
    // Let's focus on the actual children details.
    step('check term and definition values', () => {
      // Child 1
      expect(definitions[0]).toHaveTextContent('111222333');
      expect(definitions[1]).toHaveTextContent('Joe B');
      expect(definitions[2]).toHaveTextContent('May 20, 1980');

      // Child 2
      expect(definitions[3]).toHaveTextContent('923456788');
      expect(definitions[4]).toHaveTextContent('Tom Sawyer');
      expect(definitions[5]).toHaveTextContent('July 14, 1988');
    });
  },
};

export const SelectedChildrenValueDisplay: ValueDisplayStory = {
  ...BaseValueDisplayStory,
  args: {
    componentDefinition: {
      type: 'children',
      key: 'children',
      id: 'children',
      label: 'Children',
      enableSelection: true,
    } satisfies ChildrenComponentSchema,
    value: [
      // Unselected children
      {
        bsn: '123456789',
        firstNames: 'Joe C (Unselected)',
        dateOfBirth: '1984-2-13',
        selected: false,
      },
      {
        bsn: '111222333',
        firstNames: 'Joe B (Unselected)',
        dateOfBirth: '1980-5-20',
        selected: false,
      },
      // Selected child
      {
        bsn: '923456788',
        firstNames: 'Tom Sawyer (Selected)',
        dateOfBirth: '1988-7-14',
        selected: true,
      },
    ] satisfies ExtendedChildDetails[],
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    const terms = canvas.getAllByRole('term');
    const definitions = canvas.getAllByRole('definition');

    expect(terms).toHaveLength(3);
    expect(definitions).toHaveLength(3);

    // The unselected children are not displayed.
    expect(canvas.queryByText('Unselected')).not.toBeInTheDocument();

    // Expect that the details of the selected child are displayed.
    step('check definition values', () => {
      expect(definitions[0]).toHaveTextContent('923456788');
      expect(definitions[1]).toHaveTextContent('Tom Sawyer (Selected)');
      expect(definitions[2]).toHaveTextContent('July 14, 1988');
    });
  },
};
