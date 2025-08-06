import type {
  ColumnsComponentSchema,
  EditGridComponentSchema,
  FieldsetComponentSchema,
  FileComponentSchema,
  SoftRequiredErrorsComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import type {StoryObj} from '@storybook/react';
import '@utrecht/components/paragraph';
import {expect, fn, userEvent, waitFor, within} from 'storybook/test';

import {renderMultipleComponentsInForm} from '@/registry/storybook-helpers';
import {withFormik} from '@/sb-decorators';

import {FormioSoftRequiredErrors as SoftRequiredErrors} from './';

const SOFT_REQUIRED_FILE_COMPONENT = {
  id: 'file',
  key: 'file',
  type: 'file',
  label: 'Soft required upload',
  webcam: false,
  storage: 'url',
  url: '',
  file: {
    name: '',
    type: [],
    allowedTypesLabels: [],
  },
  options: {
    withCredentials: true,
  },
  filePattern: '.jpg',
  multiple: false,
  openForms: {
    translations: {},
    softRequired: true,
  },
} satisfies FileComponentSchema;

export default {
  title: 'Component registry / layout / SoftRequiredErrors',
  render: renderMultipleComponentsInForm,
  parameters: {
    formik: {
      disabled: true,
    },
  },
  component: SoftRequiredErrors,
  decorators: [withFormik],
  args: {
    onSubmit: fn(),
    componentDefinitions: [
      SOFT_REQUIRED_FILE_COMPONENT,
      {
        type: 'textfield',
        key: 'textfield',
        label: 'Soft required text',
        // @ts-ignore
        openForms: {softRequired: true},
      } satisfies TextFieldComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
};

type Story = StoryObj<typeof renderMultipleComponentsInForm>;

export const EmptyFields: Story = {
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');
    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItems = within(list).getAllByRole('listitem');
    expect(listItems).toHaveLength(2);
    const content = listItems.map(item => item.textContent);
    expect(content).toEqual(['Soft required upload', 'Soft required text']);
  },
};

export const FillField: Story = {
  args: {
    componentDefinitions: [
      {
        type: 'textfield',
        key: 'textfield',
        label: 'Soft required text',
        // @ts-ignore
        openForms: {softRequired: true},
      } satisfies TextFieldComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    await step('Initial state', async () => {
      expect(await canvas.findByText(ERROR_TEXT)).toBeVisible();
      const list = await canvas.findByRole('list', {name: 'Empty fields'});
      const listItems = within(list).getAllByRole('listitem');
      expect(listItems).toHaveLength(1);
    });

    await step('Fill out field and remove error', async () => {
      const input = canvas.getByLabelText('Soft required text');
      await userEvent.type(input, 'Not empty');
      await waitFor(() => {
        expect(canvas.queryByText(ERROR_TEXT)).toBeNull();
      });
    });
  },
};

export const WithFieldSetAndNestedComponent: Story = {
  name: 'With fieldset and nested component',
  args: {
    componentDefinitions: [
      {
        id: 'fieldset',
        key: 'fieldset',
        type: 'fieldset',
        label: "Auto's",
        hideHeader: false,
        components: [SOFT_REQUIRED_FILE_COMPONENT],
      } satisfies FieldsetComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText("Auto's")).toBeVisible();

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');
    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItem = within(list).getByRole('listitem');
    expect(listItem.textContent).toEqual("Auto's > Soft required upload");
  },
};

export const WithFieldSetAndHiddenParent: Story = {
  name: 'With fieldset and hidden parent',
  args: {
    componentDefinitions: [
      {
        id: 'fieldset',
        key: 'fieldset',
        type: 'fieldset',
        label: "Auto's",
        hidden: true,
        hideHeader: false,
        components: [SOFT_REQUIRED_FILE_COMPONENT],
      } satisfies FieldsetComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("Auto's")).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Not all required fields are filled out. That can get expensive!')
    ).not.toBeInTheDocument();
  },
};

export const WithColumnsAndNestedComponent: Story = {
  name: 'With columns and nested component',
  args: {
    componentDefinitions: [
      {
        id: 'columns',
        key: 'columns',
        type: 'columns',
        columns: [
          {
            size: 6,
            sizeMobile: 3,
            components: [SOFT_REQUIRED_FILE_COMPONENT],
          },
          {
            size: 6,
            sizeMobile: 3,
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file2',
                key: 'file2',
                label: 'Soft required upload 2',
              },
            ],
          },
        ],
      } satisfies ColumnsComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');
    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItems = within(list).getAllByRole('listitem');
    expect(listItems[0].textContent).toEqual('Soft required upload');
    expect(listItems[1].textContent).toEqual('Soft required upload 2');
  },
};

export const WithColumnsAndHiddenParent: Story = {
  name: 'With columns and hidden parent',
  args: {
    componentDefinitions: [
      {
        id: 'columns',
        key: 'columns',
        type: 'columns',
        hidden: true,
        columns: [
          {
            size: 6,
            sizeMobile: 3,
            components: [SOFT_REQUIRED_FILE_COMPONENT],
          },
          {
            size: 6,
            sizeMobile: 3,
            components: [
              {
                ...SOFT_REQUIRED_FILE_COMPONENT,
                id: 'file2',
                key: 'file2',
                label: 'Soft required upload 2',
              },
            ],
          },
        ],
      } satisfies ColumnsComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("Auto's")).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Not all required fields are filled out. That can get expensive!')
    ).not.toBeInTheDocument();
  },
};

export const WithEditGridAndNestedComponent: Story = {
  name: 'With editgrid and nested component',
  args: {
    componentDefinitions: [
      {
        id: 'editgrid',
        key: 'editgrid',
        type: 'editgrid',
        label: "Auto's",
        groupLabel: 'Auto',
        hidden: false,
        disableAddingRemovingRows: false,
        components: [SOFT_REQUIRED_FILE_COMPONENT],
      } satisfies EditGridComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    expect(await canvas.findByText("Auto's")).toBeVisible();

    // Add two items to the edit grid.
    const addButtons = canvas.queryAllByRole('button', {name: 'Add another'});
    await userEvent.click(addButtons[0]);
    await userEvent.click(addButtons[0]);

    const saveButtons = canvas.queryAllByRole('button', {name: 'Save'});
    await userEvent.click(saveButtons[0]);
    await userEvent.click(saveButtons[1]);

    await canvas.findByText('Not all required fields are filled out. That can get expensive!');
    const list = await canvas.findByRole('list', {name: 'Empty fields'});
    const listItem = within(list).getAllByRole('listitem');
    expect(listItem).toHaveLength(2);

    expect(listItem[0].textContent).toEqual("Auto's > Auto 1 > Soft required upload");
    expect(listItem[1].textContent).toEqual("Auto's > Auto 2 > Soft required upload");
  },
};

export const WithEditGridAndHiddenParent: Story = {
  name: 'With editgrid and hidden parent',
  args: {
    componentDefinitions: [
      {
        id: 'editgrid',
        key: 'editgrid',
        type: 'editgrid',
        label: "Auto's",
        groupLabel: 'Auto',
        hidden: true,
        disableAddingRemovingRows: false,
        components: [SOFT_REQUIRED_FILE_COMPONENT],
      } satisfies EditGridComponentSchema,
      {
        id: 'softRequiredErrors',
        type: 'softRequiredErrors',
        key: 'softRequiredErrors',
        label: 'softRequiredErrors',
        html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
      } satisfies SoftRequiredErrorsComponentSchema,
    ],
  },
  play: async ({canvasElement}) => {
    const canvas = within(canvasElement);

    await expect(canvas.queryByText("Auto's")).not.toBeInTheDocument();
    await expect(
      canvas.queryByText('Not all required fields are filled out. That can get expensive!')
    ).not.toBeInTheDocument();
  },
};
