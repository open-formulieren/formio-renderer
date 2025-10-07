import type {
  ColumnsComponentSchema,
  EditGridComponentSchema,
  FieldsetComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, within} from 'storybook/test';

import {getRegistryEntry} from '@/registry';
import {FormioSoftRequiredErrors} from '@/registry/softRequiredErrors/index';
import {withFormSettingsProvider, withFormik} from '@/sb-decorators';

export default {
  title: 'Component registry / layout / SoftRequiredErrors',
  component: FormioSoftRequiredErrors,
  decorators: [withFormik, withFormSettingsProvider],
  args: {
    componentDefinition: {
      id: 'softRequiredErrors',
      type: 'softRequiredErrors',
      key: 'softRequiredErrors',
      label: 'Soft required errors',
      html: `
      <p>Not all required fields are filled out. That can get expensive!</p>

      {{ missingFields }}

      <p>Are you sure you want to continue?</p>
        `,
    },
    getRegistryEntry: getRegistryEntry,
  },
} satisfies Meta<typeof FormioSoftRequiredErrors>;

type Story = StoryObj<typeof FormioSoftRequiredErrors>;

export const MinimalConfiguration: Story = {
  name: 'Minimal configuration',
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(
      await canvas.queryByText('Not all required fields are filled out. That can get expensive!')
    ).not.toBeInTheDocument();
  },
};

export const MissingTextfieldWithoutParent: Story = {
  name: 'Missing textfield without parent',
  parameters: {
    formSettings: {
      components: [
        {
          id: 'textfield',
          type: 'textfield',
          key: 'textfield',
          label: 'Textfield',
          openForms: {
            // @ts-expect-error soft required on textfield is not officially supported yet
            softRequired: true,
          },
        } satisfies TextFieldComponentSchema,
      ],
    },
    formik: {
      initialValues: {
        textfield: '',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');

    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItem = within(list).getByRole('listitem');

    expect(listItem.textContent).toEqual('Textfield');
  },
};

export const MissingTextfieldNestedInFieldset: Story = {
  name: 'Missing textfield nested in fieldset',
  parameters: {
    formSettings: {
      components: [
        {
          id: 'fieldset',
          key: 'fieldset',
          type: 'fieldset',
          label: 'Fieldset',
          hideHeader: false,
          components: [
            {
              id: 'textfield',
              type: 'textfield',
              key: 'textfield',
              label: 'Textfield',
              openForms: {
                // @ts-expect-error soft required on textfield is not officially supported yet
                softRequired: true,
              },
            } satisfies TextFieldComponentSchema,
          ],
        } satisfies FieldsetComponentSchema,
      ],
    },
    formik: {
      initialValues: {
        textfield: '',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');

    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItem = within(list).getByRole('listitem');

    expect(listItem.textContent).toEqual('Fieldset > Textfield');
  },
};

export const MissingTextfieldNestedInColumns: Story = {
  name: 'Missing textfield nested in columns',
  parameters: {
    formSettings: {
      components: [
        {
          id: 'columns',
          key: 'columns',
          type: 'columns',
          columns: [
            {
              size: 6,
              sizeMobile: 3,
              components: [
                {
                  id: 'textfield',
                  type: 'textfield',
                  key: 'textfield',
                  label: 'Textfield',
                  openForms: {
                    // @ts-expect-error soft required on textfield is not officially supported yet
                    softRequired: true,
                  },
                } satisfies TextFieldComponentSchema,
              ],
            },
            {
              size: 6,
              sizeMobile: 3,
              components: [
                {
                  id: 'textfield2',
                  type: 'textfield',
                  key: 'textfield2',
                  label: 'Textfield 2',
                  openForms: {
                    // @ts-expect-error soft required on textfield is not officially supported yet
                    softRequired: true,
                  },
                } satisfies TextFieldComponentSchema,
              ],
            },
          ],
        } satisfies ColumnsComponentSchema,
      ],
    },
    formik: {
      initialValues: {
        textfield: '',
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');

    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItems = within(list).getAllByRole('listitem');

    expect(listItems).toHaveLength(2);
    expect(listItems[0].textContent).toEqual('Textfield');
    expect(listItems[1].textContent).toEqual('Textfield 2');
  },
};

export const MissingTextfieldNestedInEditgrid: Story = {
  name: 'Missing textfield nested in editgrid',
  parameters: {
    formSettings: {
      components: [
        {
          id: 'editgrid',
          key: 'editgrid',
          type: 'editgrid',
          label: 'Editgrid',
          groupLabel: 'Editgrid item',
          hidden: false,
          disableAddingRemovingRows: false,
          components: [
            {
              id: 'textfield',
              type: 'textfield',
              key: 'textfield',
              label: 'Textfield',
              openForms: {
                // @ts-expect-error soft required on textfield is not officially supported yet
                softRequired: true,
              },
            } satisfies TextFieldComponentSchema,
          ],
        } satisfies EditGridComponentSchema,
      ],
    },
    formik: {
      initialValues: {
        editgrid: [{textfield: ''}, {textfield: ''}],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');

    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItems = within(list).getAllByRole('listitem');

    expect(listItems).toHaveLength(2);
    expect(listItems[0].textContent).toEqual('Editgrid > Editgrid item 1 > Textfield');
    expect(listItems[1].textContent).toEqual('Editgrid > Editgrid item 2 > Textfield');
  },
};

export const MissingTextfieldNestedInNestedEditgrid: Story = {
  name: 'Missing textfield nested in nested editgrid',
  parameters: {
    formSettings: {
      components: [
        {
          id: 'outerEditgrid',
          key: 'outerEditgrid',
          type: 'editgrid',
          label: 'Outer editgrid',
          groupLabel: 'Outer editgrid item',
          hidden: false,
          disableAddingRemovingRows: false,
          components: [
            {
              id: 'innerEditgrid',
              key: 'innerEditgrid',
              type: 'editgrid',
              label: 'Inner editgrid',
              groupLabel: 'Inner editgrid item',
              hidden: false,
              disableAddingRemovingRows: false,
              components: [
                {
                  id: 'textfield',
                  type: 'textfield',
                  key: 'textfield',
                  label: 'Textfield',
                  openForms: {
                    // @ts-expect-error soft required on textfield is not officially supported yet
                    softRequired: true,
                  },
                } satisfies TextFieldComponentSchema,
              ],
            } satisfies EditGridComponentSchema,
          ],
        } satisfies EditGridComponentSchema,
      ],
    },
    formik: {
      initialValues: {
        outerEditgrid: [
          {
            innerEditgrid: [{textfield: ''}, {textfield: ''}],
          },
          {
            innerEditgrid: [{textfield: ''}],
          },
        ],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');

    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItems = within(list).getAllByRole('listitem');

    expect(listItems).toHaveLength(3);
    expect(listItems[0].textContent).toEqual(
      'Outer editgrid > Outer editgrid item 1 > Inner editgrid > Inner editgrid item 1 > Textfield'
    );
    expect(listItems[1].textContent).toEqual(
      'Outer editgrid > Outer editgrid item 1 > Inner editgrid > Inner editgrid item 2 > Textfield'
    );
    expect(listItems[2].textContent).toEqual(
      'Outer editgrid > Outer editgrid item 2 > Inner editgrid > Inner editgrid item 1 > Textfield'
    );
  },
};
