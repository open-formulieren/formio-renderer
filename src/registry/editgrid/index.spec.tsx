import type {EditGridComponentSchema, TextFieldComponentSchema} from '@open-formulieren/types';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {IntlProvider} from 'react-intl';
import {expect, test, vi} from 'vitest';

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
  render(
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
  const input = await screen.findByLabelText('Trigger');
  expect(input).toBeVisible();
  expect(input).toHaveDisplayValue('');

  const textboxes = screen.queryAllByRole('textbox');
  // one for the trigger outside the editgrid, and the solo editgrid item is in preview
  // mode, so no textbox shown
  expect(textboxes).toHaveLength(1);
  expect(screen.getByText('Snowflake value')).toBeVisible();

  // now trigger the conditional logic & verify that the preview updates accordingly
  await userEvent.type(input, 'flip-em');
  // initially hidden becomes visible
  expect(screen.getByText('Initially hidden')).toBeVisible();
  expect(screen.getByText('A default!')).toBeVisible();
  // initially visible becomes hidden
  expect(screen.queryByText('Initially visible')).not.toBeInTheDocument();
  expect(screen.queryByText('Snowflake value')).not.toBeInTheDocument();

  // verify the submission values on submit
  await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
  expect(onSubmit).toHaveBeenCalledWith({
    trigger: 'flip-em',
    editgrid: [{initiallyHidden: 'A default!'}],
  });
});

test('Item values side-effects are applied to nested editgrid children in preview mode', async () => {
  const onSubmit = vi.fn();
  render(
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
  const input = await screen.findByLabelText('Trigger');
  expect(input).toBeVisible();
  expect(input).toHaveDisplayValue('');

  const textboxes = screen.queryAllByRole('textbox');
  // one for the trigger outside the editgrid, and the solo editgrid item is in preview
  // mode, so no textbox shown
  expect(textboxes).toHaveLength(1);
  expect(screen.getByText('Snowflake value')).toBeVisible();

  // now trigger the conditional logic & verify that the values get updated accordingly
  await userEvent.type(input, 'hide');
  await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
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

  render(<Form components={[component]} values={values} onSubmit={onSubmit} />);

  // check initial outer item state
  await userEvent.click(await screen.findByRole('button', {name: 'Edit item 1'}));
  const selectboxesCheckbox = await screen.findByLabelText('A');
  expect(selectboxesCheckbox).toBeVisible();
  expect(selectboxesCheckbox).not.toBeChecked();

  // check initial inner item state - this is another button than before (!)
  await userEvent.click(await screen.findByRole('button', {name: 'Edit item 1'}));
  const singleCheckbox = await screen.findByLabelText('Checkbox');
  expect(singleCheckbox).toBeVisible();
  expect(singleCheckbox).not.toBeChecked();

  expect(await screen.findAllByText(/Not displayed/)).toHaveLength(2);

  // okay, now toggle the checkboxes to trigger hiding of the content blocks
  await userEvent.click(singleCheckbox);
  expect(singleCheckbox).toBeChecked();
  await userEvent.click(selectboxesCheckbox);
  expect(selectboxesCheckbox).toBeChecked();

  expect(screen.queryAllByText(/Not displayed/)).toHaveLength(0);
});

test('Item validation schema adapts to component visibility', async () => {
  const user = userEvent.setup();
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

  render(<Form components={[component]} values={values} onSubmit={vi.fn()} />);

  // expand initial outer item
  await userEvent.click(await screen.findByRole('button', {name: 'Edit item 1'}));
  // expand initial inner item - this is another button than before (!)
  await userEvent.click(await screen.findByRole('button', {name: 'Edit item 1'}));
  const visibleInput = await screen.findByLabelText('Visible textfield');
  expect(visibleInput).toBeVisible();
  expect(visibleInput).toHaveDisplayValue('hide');
  expect(screen.queryByLabelText('Originally hidden textfield')).not.toBeInTheDocument();

  // assert that we can save without validation errors
  const saveButtons = screen.queryAllByRole<HTMLButtonElement>('button', {name: 'Save'});
  expect(saveButtons).toHaveLength(2);
  // click the inner save button - we expect it to successfully save so that only the outer save
  // button remains
  await user.click(saveButtons[0]);
  expect(screen.queryAllByRole('button', {name: 'Save'})).toHaveLength(1);
  expect(screen.queryByText('Invalid')).not.toBeInTheDocument();

  // make the second text field visible - expand the inner item again
  await userEvent.click(await screen.findByRole('button', {name: 'Edit item 1'}));
  await user.type(await screen.findByLabelText('Visible textfield'), '[Backspace]');
  expect(await screen.findByLabelText('Originally hidden textfield')).toBeVisible();

  const innerSaveButton = screen.getAllByRole<HTMLButtonElement>('button', {name: 'Save'})[0];
  await userEvent.click(innerSaveButton);
  expect(
    await screen.findByText('The submitted value does not match the pattern: [a-z]{4}.')
  ).toBeVisible();
  expect(screen.queryAllByRole('button', {name: 'Save'})).toHaveLength(2);
});

test('defaultValue: null does not crash', async () => {
  render(
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
          // @ts-expect-error type definitions and actual formio.js builder behaviour don't
          // match!
          defaultValue: null,
        },
      ]}
      onSubmit={vi.fn()}
    />
  );

  expect(screen.getByRole('button', {name: 'Add item'})).toBeVisible();
});
