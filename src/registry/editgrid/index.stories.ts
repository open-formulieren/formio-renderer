import type {
  ColumnsComponentSchema,
  ContentComponentSchema,
  FieldsetComponentSchema,
} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect, userEvent, within} from 'storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {getRegistryEntry} from '@/registry';
import {withFormik} from '@/sb-decorators';

import {FormioEditGrid} from './';

export default {
  title: 'Component registry / special / editgrid',
  component: FormioEditGrid,
  decorators: [withFormik],
  args: {
    renderNested: FormioComponent,
    getRegistryEntry: getRegistryEntry,
  },
  argTypes: {
    renderNested: {table: {disable: true}},
    getRegistryEntry: {table: {disable: true}},
  },
} satisfies Meta<typeof FormioEditGrid>;

type Story = StoryObj<typeof FormioEditGrid>;

export const MinimalConfiguration: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'editgrid',
      label: 'Repeating group',
      disableAddingRemovingRows: false,
      groupLabel: 'Nested item',
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'my.textfield',
          label: 'A simple textfield',
        },
        {
          id: 'component3',
          type: 'date',
          key: 'datefield',
          label: 'A date',
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        editgrid: [
          {
            my: {
              textfield: '',
            },
            datefield: '',
          },
        ],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {name: 'Add another'}));
  },
};

export const WithTooltip: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'editgrid',
      label: 'Repeating group',
      tooltip: 'Surprise!',
      disableAddingRemovingRows: false,
      groupLabel: 'Nested item',
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'my.textfield',
          label: 'A simple textfield',
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        editgrid: [{my: {textfield: ''}}],
      },
    },
  },
};

export const WithValidationSchema: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'editgrid',
      label: 'Repeating group',
      disableAddingRemovingRows: false,
      groupLabel: 'Nested item',
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'text',
          label: 'Numbers only, required',
          validate: {
            required: true,
            pattern: '\\d+',
          },
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        editgrid: [{text: ''}],
      },
    },
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', {name: 'Edit item 1'}));
    const input = await canvas.findByLabelText('Numbers only, required');
    await userEvent.type(input, 'abc');
    await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    expect(await canvas.findByText('Invalid')).toBeVisible();
  },
};

export const DisplayComponentValues: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'editgrid',
      label: 'Various combinations of value display',
      disableAddingRemovingRows: false,
      groupLabel: 'Nested item',
      components: [
        {
          id: 'textfieldSingle',
          type: 'textfield',
          key: 'textfieldSingle',
          label: 'Textfield single',
        },
        {
          id: 'textfieldMultiple',
          type: 'textfield',
          key: 'textfieldMultiple',
          label: 'Textfield multiple',
          multiple: true,
        },
        {
          id: 'emailSingle',
          type: 'email',
          key: 'emailSingle',
          label: 'email single',
          validateOn: 'blur',
        },
        {
          id: 'emailMultiple',
          type: 'email',
          key: 'emailMultiple',
          label: 'Email multiple',
          validateOn: 'blur',
          multiple: true,
        },
        {
          id: 'dateSingle',
          type: 'date',
          key: 'dateSingle',
          label: 'Date single',
        },
        {
          id: 'dateMultiple',
          type: 'date',
          key: 'dateMultiple',
          label: 'Date multiple',
          multiple: true,
        },
        {
          id: 'phoneNumberSingle',
          type: 'phoneNumber',
          key: 'phoneNumberSingle',
          label: 'Phone number single',
          inputMask: null,
        },
        {
          id: 'phoneNumberMultiple',
          type: 'phoneNumber',
          key: 'phoneNumberMultiple',
          label: 'Phone number multiple',
          inputMask: null,
          multiple: true,
        },
        {
          id: 'radio',
          type: 'radio',
          key: 'radio',
          label: 'Radio',
          defaultValue: null,
          openForms: {
            translations: {},
            dataSrc: 'manual',
          },
          values: [
            {
              value: 'option1',
              label: 'Option 1',
            },
            {
              value: 'option2',
              label: 'Option 2',
            },
          ],
        },
        {
          id: 'bsnSingle',
          type: 'bsn',
          key: 'bsnSingle',
          label: 'BSN single',
          inputMask: '999999999',
          validateOn: 'blur',
        },
        {
          id: 'bsnMultiple',
          type: 'bsn',
          key: 'bsnMultiple',
          label: 'BSN multiple',
          inputMask: '999999999',
          validateOn: 'blur',
          multiple: true,
        },
        {
          id: 'editgrid',
          type: 'editgrid',
          key: 'editgrid',
          label: 'Nested editgrid',
          groupLabel: 'Item',
          disableAddingRemovingRows: true,
          components: [
            {
              id: 'nestedTextfield',
              type: 'textfield',
              key: 'nestedTextfield',
              label: 'Nested textfield',
            },
          ],
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        editgrid: [
          {
            // basic
            textfieldSingle: 'Single value',
            textfieldMultiple: ['Value 1', 'Value 2'],
            emailSingle: 'openforms@example.com',
            emailMultiple: ['openforms@example.com', 'openforms@example.com'],
            dateSingle: '1980-01-01',
            dateMultiple: ['1980-01-01', '2022-03-10'],
            phoneNumberSingle: '020-123 456',
            phoneNumberMultiple: ['020-123 456', '+316 20 123 456'],
            radio: 'option2',
            // special types
            bsnSingle: '000000000',
            bsnMultiple: ['000000000', '000000000'],
            editgrid: [{nestedTextfield: 'recursion!'}, {nestedTextfield: "look, I'm displayed"}],
          },
        ],
      },
    },
  },
};

export const WithLayoutComponents: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'editgrid',
      label: 'Repeating group with layout components',
      disableAddingRemovingRows: false,
      groupLabel: 'Nested item',
      components: [
        {
          id: 'fieldset',
          type: 'fieldset',
          key: 'fieldset',
          label: 'Fieldset',
          hideHeader: false,
          components: [
            {
              id: 'nestedTextfield',
              type: 'textfield',
              key: 'nestedTextfield',
              label: 'Nested textfield',
            },
          ],
        } satisfies FieldsetComponentSchema,
        {
          id: 'content',
          type: 'content',
          key: 'content',
          label: 'I should not be visible',
          html: '<p>I may not be shown in the values display.</p>',
        } satisfies ContentComponentSchema,
        {
          id: 'columns',
          type: 'columns',
          key: 'columns',
          columns: [
            {
              size: 6,
              sizeMobile: 4,
              components: [
                {
                  id: 'columnsNestedTextfield1',
                  type: 'textfield',
                  key: 'columnsNestedTextfield1',
                  label: 'Nested textfield 1',
                },
              ],
            },
            {
              size: 6,
              sizeMobile: 4,
              components: [
                {
                  id: 'columnsNestedTextfield2',
                  type: 'textfield',
                  key: 'columnsNestedTextfield2',
                  label: 'Nested textfield 2',
                },
              ],
            },
          ],
        } satisfies ColumnsComponentSchema,
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        editgrid: [
          {
            nestedTextfield: 'nested value',
            columnsNestedTextfield1: 'column 1 value',
            columnsNestedTextfield2: 'column 2 value',
          },
        ],
      },
    },
  },
};

export const WithSimpleConditional: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'editgrid',
      label: 'Edit grid',
      disableAddingRemovingRows: false,
      groupLabel: 'Item',
      components: [
        {
          id: 'textfield',
          type: 'textfield',
          key: 'textfield',
          label: 'Must not display',
          conditional: {
            show: false,
            when: 'root',
            eq: 'hide',
          },
        },
        {
          id: 'textfield2',
          type: 'textfield',
          key: 'textfield2',
          label: 'Must display',
          conditional: {
            show: true,
            when: 'root',
            eq: 'hide',
          },
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        editgrid: [{textfield: 'A value', textfield2: 'Another value'}],
        root: 'hide',
      },
    },
  },
};

export const NestedWithSimpleConditionals: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'parent',
      label: 'Repeating group with nested repeating group',
      disableAddingRemovingRows: false,
      groupLabel: 'Parent',
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'textField1',
          label: 'Textfield 1',
          clearOnHide: false,
          conditional: {
            show: false,
            when: 'root',
            eq: 'hide nested 1',
          },
        },
        {
          id: 'component3',
          type: 'editgrid',
          key: 'child',
          label: 'Nested repeating group',
          disableAddingRemovingRows: false,
          groupLabel: 'Child',
          clearOnHide: false,
          conditional: {
            show: false,
            when: 'parent.textField1',
            eq: 'Parent 1',
          },
          components: [
            {
              id: 'component4',
              type: 'textfield',
              key: 'textField2',
              label: 'Nested 1',
              clearOnHide: false,
              conditional: {
                show: false,
                when: 'root',
                eq: 'hide nested 1',
              },
            },
            {
              id: 'component5',
              type: 'textfield',
              key: 'textField3',
              label: 'Nested 2',
              clearOnHide: false,
              conditional: {
                show: true,
                when: 'parent.child.textField2',
                eq: 'ggg',
              },
            },
          ],
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        parent: [
          {
            textField1: 'Parent 1',
            child: [
              {textField2: 'aaa', textField3: 'bbb'},
              {textField2: 'ccc', textField3: 'ddd'},
            ],
          },
          {
            textField1: 'Parent 2',
            child: [
              {textField2: 'eee', textField3: 'fff'},
              {textField2: 'ggg', textField3: 'hhh'},
            ],
          },
        ],
        root: 'hide nested 1',
      },
    },
  },

  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('Parent 2')).toBeVisible();

    expect(canvas.queryByText('Textfield 1')).not.toBeInTheDocument();
    expect(canvas.queryByText('Nested 1')).not.toBeInTheDocument();
    expect(canvas.queryAllByText('Nested 2')).toHaveLength(1);

    await step('Edit mode parent 2', async () => {
      const editButton = canvas.getByRole('button', {name: 'Edit item 2'});
      await userEvent.click(editButton);

      for (const btn of canvas.getAllByRole('button', {name: 'Edit item 1'})) {
        await userEvent.click(btn);
      }
      const editButton2 = canvas.getByRole('button', {name: 'Edit item 2'});
      await userEvent.click(editButton2);

      expect(canvas.queryByText('Nested 1')).not.toBeInTheDocument();
      expect(canvas.queryAllByText('Nested 2')).toHaveLength(1);
    });
  },
};

export const WithNestedRadio: Story = {
  args: {
    componentDefinition: {
      id: 'component1',
      type: 'editgrid',
      key: 'parent',
      label: 'Repeating group with nested radio',
      disableAddingRemovingRows: false,
      groupLabel: 'Parent',
      components: [
        {
          id: 'component2',
          type: 'textfield',
          key: 'textField1',
          label: 'Textfield 1',
          clearOnHide: false,
        },
        {
          id: 'component3',
          type: 'radio',
          key: 'radio',
          label: 'Radio',
          openForms: {
            translations: {},
            dataSrc: 'manual',
          },
          values: [
            {value: 'a', label: 'A'},
            {value: 'b', label: 'B'},
          ],
          defaultValue: null,
        },
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        parent: [],
      },
    },
  },

  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);

    await step('add initial item', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Add another'}));
      await userEvent.type(canvas.getByLabelText('Textfield 1'), 'foo');
      await userEvent.click(canvas.getByRole('radio', {name: 'A'}));
      await userEvent.click(canvas.getByRole('button', {name: 'Save'}));
    });

    await step('add second item', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Add another'}));
      await userEvent.type(canvas.getByLabelText('Textfield 1'), 'bar');
      await userEvent.click(canvas.getByRole('radio', {name: 'B'}));
    });

    await step('open item 1 edit mode', async () => {
      await userEvent.click(canvas.getByRole('button', {name: 'Edit item 1'}));

      const firstRadioA = canvas.getAllByRole('radio', {name: 'A'})[0];
      const secondRadioB = canvas.getAllByRole('radio', {name: 'B'})[1];

      expect(secondRadioB).toBeChecked();
      expect(firstRadioA).toBeChecked();
    });
  },
};
