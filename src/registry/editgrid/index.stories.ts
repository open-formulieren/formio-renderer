import {ContentComponentSchema, FieldsetComponentSchema} from '@open-formulieren/types';
import type {Meta, StoryObj} from '@storybook/react';
import {expect, userEvent, within} from '@storybook/test';

import FormioComponent from '@/components/FormioComponent';
import {getRegistryEntry} from '@/registry';
import {withFormik} from '@/sb-decorators';

import {EditGrid} from './';

export default {
  title: 'Component registry / special / editgrid',
  component: EditGrid,
  decorators: [withFormik],
  args: {
    renderNested: FormioComponent,
    getRegistryEntry: getRegistryEntry,
  },
  argTypes: {
    renderNested: {table: {disable: true}},
    getRegistryEntry: {table: {disable: true}},
  },
} satisfies Meta<typeof EditGrid>;

type Story = StoryObj<typeof EditGrid>;

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
      ],
    },
  },
  parameters: {
    formik: {
      initialValues: {
        editgrid: [{nestedTextfield: 'nested value'}],
      },
    },
  },
};
