import type {
  ColumnsComponentSchema,
  EditGridComponentSchema,
  FieldsetComponentSchema,
  SoftRequiredErrorsComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {IntlProvider} from 'react-intl';
import {describe, expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';

import FormioForm from '@/components/FormioForm';
import type {FormioFormProps} from '@/components/FormioForm';

type FormProps = Pick<FormioFormProps, 'components' | 'onSubmit' | 'values'>;

const Form: React.FC<FormProps> = props => (
  <IntlProvider locale="en" messages={{}}>
    <FormioForm {...props} id="test-form" requiredFieldsWithAsterisk />
    <button type="submit" form="test-form">
      Submit
    </button>
  </IntlProvider>
);

describe('Soft required components without parents', () => {
  test('Empty field is picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'textfield',
            type: 'textfield',
            key: 'textfield',
            label: 'Empty textfield',
            defaultValue: '',
            openForms: {
              // @ts-expect-error soft required on textfield isn't officially supported yet
              softRequired: true,
            },
          } satisfies TextFieldComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          textfield: '',
        }}
        onSubmit={onSubmit}
      />
    );

    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    await expect.element(listItem).toHaveTextContent('Empty textfield');
  });

  test('Empty soft-required editgrid is picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'editgrid',
            key: 'editgrid',
            type: 'editgrid',
            label: 'Editgrid',
            groupLabel: 'Editgrid item',
            hidden: false,
            disableAddingRemovingRows: false,
            openForms: {
              // @ts-expect-error soft required on editgrid is not officially supported yet
              softRequired: true,
            },
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          editgrid: [],
        }}
        onSubmit={onSubmit}
      />
    );

    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    await expect.element(listItem).toHaveTextContent('Editgrid');
  });

  test('Hidden empty field is not picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'textfield',
            type: 'textfield',
            key: 'textfield',
            label: 'Hidden empty textfield',
            defaultValue: '',
            hidden: true,
            openForms: {
              // @ts-expect-error soft required on textfield isn't officially supported yet
              softRequired: true,
            },
          } satisfies TextFieldComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          textfield: '',
        }}
        onSubmit={onSubmit}
      />
    );

    await expect.element(screen.getByLabelText('Hidden empty textfield')).not.toBeInTheDocument();
    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .not.toBeInTheDocument();
  });

  test('Filling a field removes it from the softRequired missing list', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'toBeFilledTextfield',
            type: 'textfield',
            key: 'toBeFilledTextfield',
            label: 'To be filled textfield',
            defaultValue: '',
            openForms: {
              // @ts-expect-error soft required on textfield isn't officially supported yet
              softRequired: true,
            },
          } satisfies TextFieldComponentSchema,
          {
            id: 'emptyTextfield',
            type: 'textfield',
            key: 'emptyTextfield',
            label: 'Empty textfield',
            defaultValue: '',
            openForms: {
              // @ts-expect-error soft required on textfield isn't officially supported yet
              softRequired: true,
            },
          } satisfies TextFieldComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          toBeFilledTextfield: '',
          emptyTextfield: '',
        }}
        onSubmit={onSubmit}
      />
    );

    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    // With both fields initially empty, we should see the error
    await expect.element(screen.getByText(ERROR_TEXT)).toBeVisible();

    const listItems = screen.getByRole('list', {name: 'Empty fields'}).getByRole('listitem').all();

    // Both fields should be marked as missing
    expect(listItems).toHaveLength(2);
    await expect.element(listItems[0]).toHaveTextContent('To be filled textfield');
    await expect.element(listItems[1]).toHaveTextContent('Empty textfield');

    // Mutate the value of 1 field
    const input = screen.getByLabelText('To be filled textfield');
    await input.fill('Not empty');

    // We expect that the updated field is removed from the soft-required missing list
    const updatedListItems = screen
      .getByRole('list', {name: 'Empty fields'})
      .getByRole('listitem')
      .all();
    expect(updatedListItems).toHaveLength(1);
    await expect.element(updatedListItems[0]).toHaveTextContent('Empty textfield');
  });

  test('The softRequired message is only shown when there are empty softRequired fields', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'toBeFilledTextfield',
            type: 'textfield',
            key: 'toBeFilledTextfield',
            label: 'To be filled textfield',
            defaultValue: '',
            openForms: {
              // @ts-expect-error soft required on textfield isn't officially supported yet
              softRequired: true,
            },
          } satisfies TextFieldComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          toBeFilledTextfield: '',
        }}
        onSubmit={onSubmit}
      />
    );

    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    // With the field initially empty, we should see the error
    await expect.element(screen.getByText(ERROR_TEXT)).toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    await expect.element(listItem).toHaveTextContent('To be filled textfield');

    // Mutate the value of the missing field
    const input = screen.getByLabelText('To be filled textfield');
    await input.fill('Not empty');

    // We expect that the softRequired message is removed
    await expect.element(screen.getByText(ERROR_TEXT)).not.toBeInTheDocument();
  });
});

describe('Soft required components nested in fieldset', () => {
  test('Nested empty field is picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'fieldset',
            key: 'fieldset',
            type: 'fieldset',
            label: "Auto's",
            hideHeader: false,
            components: [
              {
                id: 'textfield',
                type: 'textfield',
                key: 'textfield',
                label: 'Empty textfield',
                defaultValue: '',
                openForms: {
                  // @ts-expect-error soft required on textfield isn't officially supported yet
                  softRequired: true,
                },
              } satisfies TextFieldComponentSchema,
            ],
          } satisfies FieldsetComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          textfield: '',
        }}
        onSubmit={onSubmit}
      />
    );

    await expect.element(screen.getByText("Auto's", {exact: true})).toBeVisible();

    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    await expect.element(listItem).toHaveTextContent("Auto's > Empty textfield");
  });

  test('Filling a field removes it from the softRequired missing list', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'fieldset',
            key: 'fieldset',
            type: 'fieldset',
            label: "Auto's",
            hideHeader: false,
            components: [
              {
                id: 'textfield',
                type: 'textfield',
                key: 'textfield',
                label: 'Empty textfield',
                defaultValue: '',
                openForms: {
                  // @ts-expect-error soft required on textfield isn't officially supported yet
                  softRequired: true,
                },
              } satisfies TextFieldComponentSchema,
            ],
          } satisfies FieldsetComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          textfield: '',
        }}
        onSubmit={onSubmit}
      />
    );

    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    // With the field initially empty, we should see the error
    await expect.element(screen.getByText(ERROR_TEXT)).toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    // The field should be marked as missing
    await expect.element(listItem).toHaveTextContent("Auto's > Empty textfield");

    // Mutate the value of the field
    const input = screen.getByLabelText('Empty textfield');
    await input.fill('Not empty');

    // We expect that the softRequires message is removed
    await expect.element(screen.getByText(ERROR_TEXT)).not.toBeInTheDocument();
  });

  test('Nested empty field in hidden parent is not picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'fieldset',
            key: 'fieldset',
            type: 'fieldset',
            label: "Auto's",
            hidden: true,
            hideHeader: false,
            components: [
              {
                id: 'textfield',
                type: 'textfield',
                key: 'textfield',
                label: 'Empty textfield',
                defaultValue: '',
                openForms: {
                  // @ts-expect-error soft required on textfield isn't officially supported yet
                  softRequired: true,
                },
              } satisfies TextFieldComponentSchema,
            ],
          } satisfies FieldsetComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          textfield: '',
        }}
        onSubmit={onSubmit}
      />
    );

    await expect.element(screen.getByText("Auto's")).not.toBeInTheDocument();
    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .not.toBeInTheDocument();
  });
});

describe('Soft required components nested in columns', () => {
  test('Nested empty field is picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'columns',
            key: 'columns',
            type: 'columns',
            columns: [
              {
                size: 6,
                sizeMobile: 4,
                components: [
                  {
                    id: 'textfield1',
                    type: 'textfield',
                    key: 'textfield1',
                    label: 'Empty textfield 1',
                    defaultValue: '',
                    openForms: {
                      // @ts-expect-error soft required on textfield isn't officially supported yet
                      softRequired: true,
                    },
                  } satisfies TextFieldComponentSchema,
                ],
              },
              {
                size: 6,
                sizeMobile: 4,
                components: [
                  {
                    id: 'textfield2',
                    type: 'textfield',
                    key: 'textfield2',
                    label: 'Empty textfield 2',
                    defaultValue: '',
                    openForms: {
                      // @ts-expect-error soft required on textfield isn't officially supported yet
                      softRequired: true,
                    },
                  } satisfies TextFieldComponentSchema,
                ],
              },
            ],
          } satisfies ColumnsComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          textfield1: '',
          textfield2: '',
        }}
        onSubmit={onSubmit}
      />
    );

    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItems = list.getByRole('listitem').all();

    expect(listItems).toHaveLength(2);
    await expect.element(listItems[0]).toHaveTextContent('Empty textfield 1');
    await expect.element(listItems[1]).toHaveTextContent('Empty textfield 2');
  });

  test('Filling a field removes it from the softRequired missing list', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'columns',
            key: 'columns',
            type: 'columns',
            columns: [
              {
                size: 6,
                sizeMobile: 4,
                components: [
                  {
                    id: 'toBeFilledTextfield',
                    type: 'textfield',
                    key: 'toBeFilledTextfield',
                    label: 'To be filled textfield',
                    defaultValue: '',
                    openForms: {
                      // @ts-expect-error soft required on textfield isn't officially supported yet
                      softRequired: true,
                    },
                  } satisfies TextFieldComponentSchema,
                ],
              },
              {
                size: 6,
                sizeMobile: 4,
                components: [
                  {
                    id: 'emptyTextfield',
                    type: 'textfield',
                    key: 'emptyTextfield',
                    label: 'Empty textfield',
                    defaultValue: '',
                    openForms: {
                      // @ts-expect-error soft required on textfield isn't officially supported yet
                      softRequired: true,
                    },
                  } satisfies TextFieldComponentSchema,
                ],
              },
            ],
          } satisfies ColumnsComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          textfield1: '',
          textfield2: '',
        }}
        onSubmit={onSubmit}
      />
    );

    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    // With the field initially empty, we should see the error
    await expect.element(screen.getByText(ERROR_TEXT)).toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItems = list.getByRole('listitem').all();

    // Both fields should be marked as missing
    expect(listItems).toHaveLength(2);
    await expect.element(listItems[0]).toHaveTextContent('To be filled textfield');
    await expect.element(listItems[1]).toHaveTextContent('Empty textfield');

    // Mutate the value of 1 field
    const input = screen.getByLabelText('To be filled textfield');
    await input.fill('Not empty');

    // We expect that the updated field is removed from the soft-required missing list
    const updatedListItems = list.getByRole('listitem').all();
    expect(updatedListItems).toHaveLength(1);
    await expect.element(updatedListItems[0]).toHaveTextContent('Empty textfield');
  });

  test('Nested empty field in hidden parent is not picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'columns',
            key: 'columns',
            type: 'columns',
            hidden: true,
            columns: [
              {
                size: 6,
                sizeMobile: 4,
                components: [
                  {
                    id: 'textfield1',
                    type: 'textfield',
                    key: 'textfield1',
                    label: 'Empty textfield 2',
                    defaultValue: '',
                    openForms: {
                      // @ts-expect-error soft required on textfield isn't officially supported yet
                      softRequired: true,
                    },
                  } satisfies TextFieldComponentSchema,
                ],
              },
              {
                size: 6,
                sizeMobile: 4,
                components: [
                  {
                    id: 'textfield2',
                    type: 'textfield',
                    key: 'textfield2',
                    label: 'Empty textfield 2',
                    defaultValue: '',
                    openForms: {
                      // @ts-expect-error soft required on textfield isn't officially supported yet
                      softRequired: true,
                    },
                  } satisfies TextFieldComponentSchema,
                ],
              },
            ],
          } satisfies ColumnsComponentSchema,
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          textfield1: '',
          textfield2: '',
        }}
        onSubmit={onSubmit}
      />
    );

    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .not.toBeInTheDocument();
  });
});

describe('Soft required components nested in editgrid', () => {
  test('Nested empty field is picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'editgrid',
            key: 'editgrid',
            type: 'editgrid',
            label: "Auto's",
            groupLabel: 'Auto',
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          editgrid: [
            {
              textfield: '',
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    );

    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    await expect.element(listItem).toHaveTextContent("Auto's > Auto 1 > Textfield");
  });

  test('Adding new nested empty field is picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          editgrid: [],
        }}
        onSubmit={onSubmit}
      />
    );

    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    // Without any softrequired fields, the error should not be shown
    await expect.element(screen.getByText(ERROR_TEXT)).not.toBeInTheDocument();

    // Add an item to the edit grid.
    const addButton = screen.getByRole('button', {name: 'Add another'});
    await addButton.click();

    // The empty soft-required fields in the newly added editgrid item are immediately
    // added to the missing list.
    await expect.element(screen.getByText(ERROR_TEXT)).toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    await expect.element(listItem).toHaveTextContent('Editgrid > Editgrid item 1 > Textfield');
  });

  test('Filling a field removes it from the softRequired missing list', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'editgrid',
            key: 'editgrid',
            type: 'editgrid',
            label: "Auto's",
            groupLabel: 'Auto',
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          editgrid: [
            {
              textfield: '',
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    );

    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    // With the field initially empty, we should see the error
    await expect.element(screen.getByText(ERROR_TEXT)).toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    // the field should be marked as missing
    await expect.element(listItem).toHaveTextContent("Auto's > Auto 1 > Textfield");

    // Edit the editgrid item
    const editButton = screen.getByRole('button', {name: 'Edit item 1'});
    await editButton.click();

    // Mutate the value of the field
    const input = screen.getByLabelText('Textfield');
    await input.fill('Not empty');

    // Save the editgrid item
    const saveButton = screen.getByRole('button', {name: 'Save'});
    await saveButton.click();

    // We expect that the updated field is removed from the soft-required missing list
    await expect.element(screen.getByText(ERROR_TEXT)).not.toBeInTheDocument();
  });

  test('Nested empty field in hidden parent is not picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'editgrid',
            key: 'editgrid',
            type: 'editgrid',
            label: "Auto's",
            groupLabel: 'Auto',
            hidden: true,
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          editgrid: [
            {
              textfield: '',
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    );

    await expect.element(screen.getByText("Auto's")).not.toBeInTheDocument();
    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .not.toBeInTheDocument();
  });
});

describe('Soft required components nested in nested editgrid', () => {
  test('Multiple nested empty field is picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          outerEditgrid: [
            {
              innerEditgrid: [
                {
                  textfield: '',
                },
                {
                  textfield: '',
                },
              ],
            },
            {
              innerEditgrid: [
                {
                  textfield: '',
                },
              ],
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    );

    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItems = list.getByRole('listitem').all();

    expect(listItems).toHaveLength(3);
    await expect
      .element(listItems[0])
      .toHaveTextContent(
        'Outer editgrid > Outer editgrid item 1 > Inner editgrid > Inner editgrid item 1 > Textfield'
      );
    await expect
      .element(listItems[1])
      .toHaveTextContent(
        'Outer editgrid > Outer editgrid item 1 > Inner editgrid > Inner editgrid item 2 > Textfield'
      );
    await expect
      .element(listItems[2])
      .toHaveTextContent(
        'Outer editgrid > Outer editgrid item 2 > Inner editgrid > Inner editgrid item 1 > Textfield'
      );
  });

  test('Nested empty soft-required editgrid is picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
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
                openForms: {
                  // @ts-expect-error soft required on editgrid is not officially supported yet
                  softRequired: true,
                },
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          outerEditgrid: [
            {
              innerEditgrid: [],
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    );

    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    await expect
      .element(listItem)
      .toHaveTextContent('Outer editgrid > Outer editgrid item 1 > Inner editgrid');
  });

  test('Filling a field removes it from the softRequired missing list', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          outerEditgrid: [
            {
              innerEditgrid: [
                {
                  textfield: '',
                },
              ],
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    );

    const ERROR_TEXT = 'Not all required fields are filled out. That can get expensive!';

    // With the field initially empty, we should see the error
    await expect.element(screen.getByText(ERROR_TEXT)).toBeVisible();

    const list = screen.getByRole('list', {name: 'Empty fields'});
    const listItem = list.getByRole('listitem');

    // the field should be marked as missing
    await expect
      .element(listItem)
      .toHaveTextContent(
        'Outer editgrid > Outer editgrid item 1 > Inner editgrid > Inner editgrid item 1 > Textfield'
      );

    // Edit the editgrid item.
    // We have to click edit twice, for the outer editgrid and the inner editgrid
    await screen.getByRole('button', {name: 'Edit item 1'}).click();
    await screen.getByRole('button', {name: 'Edit item 1'}).click();

    // Mutate the value of the field
    const input = screen.getByLabelText('Textfield');
    await input.fill('Not empty');

    // Save the inner editgrid item
    const saveButtons = screen.getByRole('button', {name: 'Save'}).all();
    await saveButtons[0].click();

    // We expect that the updated field is still present in the soft-required missing
    // list. It will be updated once the most outer editgrid is updated.
    await expect.element(screen.getByText(ERROR_TEXT)).toBeVisible();
    await expect.element(listItem).toBeVisible();
    await expect
      .element(listItem)
      .toHaveTextContent(
        'Outer editgrid > Outer editgrid item 1 > Inner editgrid > Inner editgrid item 1 > Textfield'
      );

    // Save the outer editgrid item
    await screen.getByRole('button', {name: 'Save'}).click();

    // We expect that the updated field is no-longer present in the soft-required missing
    // list.
    await expect.element(screen.getByText(ERROR_TEXT)).not.toBeInTheDocument();
  });

  test('Nested empty field in hidden parent is not picked-up by softRequired component', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'outerEditgrid',
            key: 'outerEditgrid',
            type: 'editgrid',
            label: 'Outer editgrid',
            groupLabel: 'Outer editgrid item',
            hidden: true,
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
          {
            id: 'softRequiredErrors',
            type: 'softRequiredErrors',
            key: 'softRequiredErrors',
            html: `
        <p>Not all required fields are filled out. That can get expensive!</p>

        {{ missingFields }}

        <p>Are you sure you want to continue?</p>
          `,
          } satisfies SoftRequiredErrorsComponentSchema,
        ]}
        values={{
          outerEditgrid: [
            {
              innerEditgrid: [
                {
                  textfield: '',
                },
              ],
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    );

    await expect.element(screen.getByText('Outer editgrid')).not.toBeInTheDocument();
    await expect
      .element(screen.getByText('Not all required fields are filled out. That can get expensive!'))
      .not.toBeInTheDocument();
  });
});
