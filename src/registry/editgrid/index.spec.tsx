import type {EditGridComponentSchema, TextFieldComponentSchema} from '@open-formulieren/types';
import {IntlProvider} from 'react-intl';
import {expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';

import FormioForm from '@/components/FormioForm';
import type {FormioFormProps} from '@/components/FormioForm';
import type {JSONObject} from '@/types';

type FormProps = Pick<FormioFormProps, 'components' | 'onSubmit' | 'values'>;

const Form: React.FC<FormProps> = props => (
  <IntlProvider locale="en" messages={{}}>
    <FormioForm {...props} id="test-form" requiredFieldsWithAsterisk />
    <button type="submit" form="test-form">
      Submit
    </button>
  </IntlProvider>
);

test('Item values side-effects are applied on hide/visible in preview mode', async () => {
  // when a component inside an editgrid item becomes visible or hidden, the
  // side-effects on the values must be applied, even when the item in preview mode.
  const onSubmit = vi.fn();
  const screen = await render(
    <Form
      components={[
        {
          id: 'comp1',
          type: 'textfield',
          key: 'trigger',
          label: 'Trigger',
          defaultValue: '',
        },
        {
          id: 'editgrid',
          type: 'editgrid',
          key: 'editgrid',
          label: 'Edit grid',
          groupLabel: 'Item',
          disableAddingRemovingRows: false,
          components: [
            {
              id: 'initiallyHidden',
              key: 'initiallyHidden',
              type: 'textfield',
              label: 'Initially hidden',
              defaultValue: 'A default!',
              conditional: {
                show: true,
                when: 'trigger',
                eq: 'flip-em',
              },
              clearOnHide: true,
            },
            {
              id: 'initiallyVisible',
              key: 'initiallyVisible',
              type: 'textfield',
              label: 'Initially visible',
              defaultValue: 'A default!',
              conditional: {
                show: false,
                when: 'trigger',
                eq: 'flip-em',
              },
              clearOnHide: true,
            },
          ],
        },
      ]}
      values={{
        editgrid: [{initiallyVisible: 'Snowflake value'}],
      }}
      onSubmit={onSubmit}
    />
  );
  const input = screen.getByLabelText('Trigger');
  await expect.element(input).toBeVisible();
  await expect.element(input).toHaveDisplayValue('');

  const textboxes = screen.getByRole('textbox').all();
  // one for the trigger outside the editgrid, and the solo editgrid item is in preview
  // mode, so no textbox shown
  expect(textboxes).toHaveLength(1);
  await expect.element(screen.getByText('Snowflake value')).toBeVisible();

  // now trigger the conditional logic & verify that the preview updates accordingly
  await input.fill('flip-em');
  // initially hidden becomes visible
  await expect.element(screen.getByText('Initially hidden')).toBeVisible();
  await expect.element(screen.getByText('A default!')).toBeVisible();
  // initially visible becomes hidden
  await expect.element(screen.getByText('Initially visible')).not.toBeInTheDocument();
  await expect.element(screen.getByText('Snowflake value')).not.toBeInTheDocument();

  // verify the submission values on submit
  await screen.getByRole('button', {name: 'Submit'}).click();
  expect(onSubmit).toHaveBeenCalledWith({
    trigger: 'flip-em',
    editgrid: [{initiallyHidden: 'A default!'}],
  });
});

test('Item values side-effects are applied to nested editgrid children in preview mode', async () => {
  const onSubmit = vi.fn();
  const screen = await render(
    <Form
      components={[
        {
          id: 'trigger',
          key: 'trigger',
          type: 'textfield',
          label: 'Trigger',
        },
        {
          id: 'editgrid',
          type: 'editgrid',
          key: 'editgrid',
          label: 'Edit grid',
          groupLabel: 'Item',
          disableAddingRemovingRows: false,
          components: [
            {
              id: 'nestedEditgrid',
              type: 'editgrid',
              key: 'nestedEditgrid',
              label: 'Nested edit grid',
              groupLabel: 'Nested item',
              disableAddingRemovingRows: false,
              components: [
                {
                  id: 'initiallyVisible',
                  key: 'initiallyVisible',
                  type: 'textfield',
                  label: 'Initially visible',
                  defaultValue: '',
                  clearOnHide: true,
                  conditional: {
                    show: false,
                    when: 'trigger',
                    eq: 'hide',
                  },
                },
              ],
            },
          ],
        },
      ]}
      values={{
        trigger: '',
        editgrid: [{nestedEditgrid: [{initiallyVisible: 'Snowflake value'}]}],
      }}
      onSubmit={onSubmit}
    />
  );
  const input = screen.getByLabelText('Trigger');
  await expect.element(input).toBeVisible();
  await expect.element(input).toHaveDisplayValue('');

  const textboxes = screen.getByRole('textbox').all();
  // one for the trigger outside the editgrid, and the solo editgrid item is in preview
  // mode, so no textbox shown
  expect(textboxes).toHaveLength(1);
  await expect.element(screen.getByText('Snowflake value')).toBeVisible();

  // now trigger the conditional logic & verify that the values get updated accordingly
  await input.fill('hide');
  await screen.getByRole('button', {name: 'Submit'}).click();
  expect(onSubmit).toHaveBeenCalledWith({
    trigger: 'hide',
    editgrid: [{nestedEditgrid: [{}]}],
  });
});

test('Nested unconventional components visibility check evaluates correctly', async () => {
  // selectboxes and components with multiple: true have some specific behaviour that
  // must be preserved in edit grids
  interface Values extends JSONObject {
    outer: {
      selectboxes: {a: boolean};
      inner: {
        checkbox: boolean;
      }[];
    }[];
  }
  const component: EditGridComponentSchema = {
    id: 'outer',
    type: 'editgrid',
    key: 'outer',
    label: 'Outer',
    groupLabel: 'Outer item',
    disableAddingRemovingRows: false,
    components: [
      {
        type: 'selectboxes',
        id: 'selectboxes',
        key: 'selectboxes',
        label: 'Select boxes',
        values: [{value: 'a', label: 'A'}],
        defaultValue: {a: false},
        openForms: {translations: {}, dataSrc: 'manual'},
      },
      {
        id: 'inner',
        type: 'editgrid',
        key: 'inner',
        label: 'inner',
        groupLabel: 'Inner item',
        disableAddingRemovingRows: false,
        components: [
          {
            type: 'checkbox',
            key: 'checkbox',
            id: 'checkbox',
            label: 'Checkbox',
            defaultValue: false,
          },
          {
            type: 'content',
            id: 'content1',
            key: 'content1',
            html: 'Not displayed 1',
            conditional: {
              show: false,
              when: 'outer.selectboxes',
              eq: 'a',
            },
          },
          {
            type: 'content',
            id: 'content2',
            key: 'content2',
            html: 'Not displayed 2',
            conditional: {
              show: false,
              when: 'outer.inner.checkbox',
              eq: true,
            },
          },
        ],
      },
    ],
  };
  const values: Values = {
    outer: [
      {
        selectboxes: {a: false},
        inner: [{checkbox: false}],
      },
    ],
  };
  const onSubmit = vi.fn();

  const screen = await render(
    <Form components={[component]} values={values} onSubmit={onSubmit} />
  );

  // check initial outer item state
  await screen.getByRole('button', {name: 'Edit item 1'}).click();
  const selectboxesCheckbox = screen.getByLabelText('A');
  await expect.element(selectboxesCheckbox).toBeVisible();
  await expect.element(selectboxesCheckbox).not.toBeChecked();

  // check initial inner item state - this is another button than before (!)
  await screen.getByRole('button', {name: 'Edit item 1'}).click();
  const singleCheckbox = screen.getByLabelText('Checkbox');
  await expect.element(singleCheckbox).toBeVisible();
  await expect.element(singleCheckbox).not.toBeChecked();

  expect(screen.getByText(/Not displayed/).all()).toHaveLength(2);

  // okay, now toggle the checkboxes to trigger hiding of the content blocks
  await singleCheckbox.click();
  await expect.element(singleCheckbox).toBeChecked();
  await selectboxesCheckbox.click();
  await expect.element(selectboxesCheckbox).toBeChecked();

  expect(screen.getByText(/Not displayed/).all()).toHaveLength(0);
});

test('Item validation schema adapts to component visibility', async () => {
  interface Values extends JSONObject {
    outer: {
      inner: {
        visible: string;
        hidden?: string;
      }[];
    }[];
  }
  const component: EditGridComponentSchema = {
    type: 'editgrid',
    id: 'outer',
    key: 'outer',
    label: 'Outer',
    groupLabel: 'Outer item',
    disableAddingRemovingRows: true, // less buttons to query
    components: [
      {
        type: 'editgrid',
        id: 'inner',
        key: 'inner',
        label: 'Inner',
        groupLabel: 'Inner item',
        disableAddingRemovingRows: true, // less buttons to query
        components: [
          {
            type: 'textfield',
            id: 'visible',
            key: 'visible',
            label: 'Visible textfield',
            hidden: false,
            clearOnHide: true,
            validate: {required: true},
          } satisfies TextFieldComponentSchema,
          {
            type: 'textfield',
            id: 'hidden',
            key: 'hidden',
            label: 'Originally hidden textfield',
            conditional: {
              show: false,
              when: 'outer.inner.visible',
              eq: 'hide',
            },
            clearOnHide: false,
            validate: {pattern: '[a-z]{4}'}, // 4 letters
          } satisfies TextFieldComponentSchema,
        ],
      } satisfies EditGridComponentSchema,
    ],
  };
  const values: Values = {
    outer: [
      {
        inner: [
          {
            visible: 'hide',
            // does not match pattern, but is hidden so validation must be skipped
            hidden: '123',
          },
        ],
      },
    ],
  };

  const screen = await render(<Form components={[component]} values={values} onSubmit={vi.fn()} />);

  // expand initial outer item
  await screen.getByRole('button', {name: 'Edit item 1'}).click();
  // expand initial inner item - this is another button than before (!)
  await screen.getByRole('button', {name: 'Edit item 1'}).click();
  const visibleInput = screen.getByLabelText('Visible textfield');
  await expect.element(visibleInput).toBeVisible();
  await expect.element(visibleInput).toHaveDisplayValue('hide');
  await expect
    .element(screen.getByLabelText('Originally hidden textfield'))
    .not.toBeInTheDocument();

  // assert that we can save without validation errors
  const saveButtons = screen.getByRole('button', {name: 'Save'}).all();
  expect(saveButtons).toHaveLength(2);
  // click the inner save button - we expect it to successfully save so that only the outer save
  // button remains
  await saveButtons[0].click();
  expect(screen.getByRole('button', {name: 'Save'}).all()).toHaveLength(1);
  await expect.element(screen.getByText('Invalid')).not.toBeInTheDocument();

  // make the second text field visible - expand the inner item again
  await screen.getByRole('button', {name: 'Edit item 1'}).click();
  await screen.getByLabelText('Visible textfield').fill('[Backspace]');
  await expect.element(screen.getByLabelText('Originally hidden textfield')).toBeVisible();

  const innerSaveButton = screen.getByRole('button', {name: 'Save'}).all()[0];
  await innerSaveButton.click();
  await expect
    .element(screen.getByText('The submitted value does not match the pattern: [a-z]{4}.'))
    .toBeVisible();
  expect(screen.getByRole('button', {name: 'Save'}).all()).toHaveLength(2);
});

test('defaultValue: null does not crash', async () => {
  const screen = await render(
    <Form
      components={[
        {
          id: 'editgrid',
          type: 'editgrid',
          key: 'editgrid',
          label: 'Edit grid',
          groupLabel: 'Item',
          addAnother: 'Add item',
          disableAddingRemovingRows: false,
          components: [],
          defaultValue: null,
        },
      ]}
      onSubmit={vi.fn()}
    />
  );

  await expect.element(screen.getByRole('button', {name: 'Add item'})).toBeVisible();
});
