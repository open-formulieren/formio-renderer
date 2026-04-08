import type {
  AnyComponentSchema,
  EditGridComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {useFormikContext} from 'formik';
import {createRef, forwardRef, useEffect, useState} from 'react';
import {IntlProvider} from 'react-intl';
import {describe, expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

import FormioForm from './FormioForm';
import type {Errors, FormStateRef, FormioFormProps} from './FormioForm';

type FormProps = Pick<
  FormioFormProps,
  'components' | 'onChange' | 'onSubmit' | 'values' | 'children'
>;

const Form = forwardRef<FormStateRef, FormProps>((props, ref) => {
  return (
    <IntlProvider locale="en" messages={{}}>
      <FormioForm {...props} ref={ref} id="test-form" requiredFieldsWithAsterisk />
      <button type="submit" form="test-form">
        Submit
      </button>
    </IntlProvider>
  );
});

describe('Updating form values', () => {
  test('Simple flat configuration', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'textfield',
            key: 'foo',
            label: 'Foo',
            defaultValue: '',
          },
        ]}
        onSubmit={onSubmit}
      />
    );

    const input = screen.getByLabelText('Foo');
    await expect.element(input).toBeVisible();
    await expect.element(input).toHaveDisplayValue('');

    // now mutate the form values and check that the state updates accordingly
    ref.current!.updateValues({foo: 'bar'});
    await expect.element(input).toHaveDisplayValue('bar');

    // and values should be reflected accordingly on submission
    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({foo: 'bar'});
  });

  test('Supports partial updates', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'textfield',
            key: 'foo',
            label: 'Foo',
            defaultValue: '',
          },
          {
            id: 'comp2',
            type: 'textfield',
            key: 'bar',
            label: 'Bar',
            defaultValue: 'Bar',
          },
        ]}
        onSubmit={onSubmit}
      />
    );

    const fooInput = screen.getByLabelText('Foo');
    await expect.element(fooInput).toBeVisible();
    await expect.element(fooInput).toHaveDisplayValue('');

    const barInput = screen.getByLabelText('Bar');
    await expect.element(barInput).toBeVisible();
    await expect.element(barInput).toHaveDisplayValue('Bar');

    ref.current!.updateValues({foo: 'updated'});
    await expect.element(fooInput).toHaveDisplayValue('updated');
    await expect.element(barInput).toHaveDisplayValue('Bar');

    // and values should be reflected accordingly on submission
    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({
      foo: 'updated',
      bar: 'Bar',
    });
  });

  test('Supports partial deep updates', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'textfield',
            key: 'parent.nested1',
            label: 'Foo',
            defaultValue: 'foo',
          },
          {
            id: 'comp2',
            type: 'textfield',
            key: 'parent.nested2',
            label: 'Bar',
            defaultValue: 'bar',
          },
        ]}
        onSubmit={onSubmit}
      />
    );

    ref.current!.updateValues({parent: {nested2: 'updated'}});

    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({
      parent: {
        nested1: 'foo',
        nested2: 'updated',
      },
    });
  });

  test('Supports full (deep) updates', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'textfield',
            key: 'parent.nested1',
            label: 'Foo',
            defaultValue: 'foo',
          },
          {
            id: 'comp2',
            type: 'textfield',
            key: 'parent.nested2',
            label: 'Bar',
            defaultValue: 'bar',
          },
        ]}
        onSubmit={onSubmit}
      />
    );

    ref.current!.updateValues({parent: {nested1: 'changed', nested2: 'changed2'}});

    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({
      parent: {
        nested1: 'changed',
        nested2: 'changed2',
      },
    });
  });

  test('Can replace editgrid as a whole', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'editgrid',
            key: 'editgrid',
            label: 'Repeating group',
            disableAddingRemovingRows: false,
            groupLabel: 'Item',
            components: [
              {
                id: 'comp2',
                type: 'textfield',
                key: 'name',
                label: 'Name',
              },
            ],
            defaultValue: [{name: 'Initial'}],
          },
        ]}
        onSubmit={onSubmit}
      />
    );
    // sanity check the initial state
    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({editgrid: [{name: 'Initial'}]});

    ref.current!.updateValues({editgrid: [{name: 'Updated'}, {name: 'New'}]});

    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({editgrid: [{name: 'Updated'}, {name: 'New'}]});
  });

  test('Update whole editgrid value to remove an item', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'editgrid',
            key: 'editgrid',
            label: 'Repeating group',
            disableAddingRemovingRows: false,
            groupLabel: 'Item',
            components: [
              {
                id: 'comp2',
                type: 'textfield',
                key: 'name',
                label: 'Name',
              },
            ],
          },
        ]}
        values={{editgrid: [{name: 'First'}, {name: 'Second'}]}}
        onSubmit={onSubmit}
      />
    );
    // sanity check the initial state
    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({editgrid: [{name: 'First'}, {name: 'Second'}]});

    // remove the first item
    ref.current!.updateValues({editgrid: [{name: 'Second'}]});

    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({editgrid: [{name: 'Second'}]});
  });

  test('Can replace individual editgrid items', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'editgrid',
            key: 'editgrid',
            label: 'Repeating group',
            disableAddingRemovingRows: false,
            groupLabel: 'Item',
            components: [
              {
                id: 'comp2',
                type: 'textfield',
                key: 'name',
                label: 'Name',
              },
              {
                id: 'comp3',
                type: 'textfield',
                key: 'other',
                label: 'Other',
              },
            ],
            defaultValue: [
              {name: 'Initial', other: 'Other 1'},
              {name: 'Initial 2', other: 'Other 2'},
            ],
          },
        ]}
        onSubmit={onSubmit}
      />
    );

    ref.current!.updateValues({'editgrid.0': {name: 'Updated'}});

    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({
      editgrid: [
        {name: 'Updated', other: 'Other 1'},
        {name: 'Initial 2', other: 'Other 2'},
      ],
    });
  });

  test('Can deep partial update editgrid items', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'editgrid',
            key: 'editgrid',
            label: 'Repeating group',
            disableAddingRemovingRows: false,
            groupLabel: 'Item',
            components: [
              {
                id: 'comp2',
                type: 'textfield',
                key: 'name',
                label: 'Name',
              },
              {
                id: 'comp3',
                type: 'textfield',
                key: 'other',
                label: 'Other',
              },
            ],
            defaultValue: [
              {name: 'Initial', other: 'Other 1'},
              {name: 'Initial 2', other: 'Other 2'},
            ],
          },
        ]}
        onSubmit={onSubmit}
      />
    );

    ref.current!.updateValues({'editgrid.0.name': 'Updated', bar: undefined});

    await screen.getByRole('button', {name: 'Submit'}).click();
    expect(onSubmit).toHaveBeenCalledWith({
      editgrid: [
        {name: 'Updated', other: 'Other 1'},
        {name: 'Initial 2', other: 'Other 2'},
      ],
    });
  });
});

// mostly a type checker test :-)
test('Errors type assignment', () => {
  const errors: Errors = {
    string: 'string',
    stringArray: ['string'],
    undefined: undefined,
    parent: {
      child: 'child',
      childArray: ['child'],
    },
    editgrid: [
      {
        string: 'string',
        stringArray: [''],
      },
    ],
    parentEditgrid: [
      'string',
      {
        nestedEditgrid: [
          'string',
          {
            string: 'string',
            stringArray: ['string'],
          },
        ],
      },
    ],
  };

  expect(errors).toBeTypeOf('object');
});

describe('Updating form errors', () => {
  test('Display flat and deep nested errors', async () => {
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'textfield',
            key: 'foo',
            label: 'Foo',
            defaultValue: '',
          },
          {
            id: 'comp2',
            type: 'textfield',
            key: 'bar.baz',
            label: 'Baz',
            defaultValue: '',
          },
        ]}
        onSubmit={vi.fn()}
      />
    );

    ref.current!.updateErrors({
      foo: 'Visible foo error',
      bar: {
        baz: 'Visible bar.baz error',
      },
    });

    await expect.element(screen.getByText('Visible foo error')).toBeVisible();
    await expect.element(screen.getByText('Visible bar.baz error')).toBeVisible();
  });

  test('Display dotted key errors', async () => {
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp2',
            type: 'textfield',
            key: 'bar.baz',
            label: 'Baz',
            defaultValue: '',
          },
        ]}
        onSubmit={vi.fn()}
      />
    );

    ref.current!.updateErrors({'bar.baz': 'Visible bar.baz error'});

    await expect.element(screen.getByText('Visible bar.baz error')).toBeVisible();
  });

  test('Ignore invalid key errors', async () => {
    const ref = createRef<FormStateRef>();
    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp2',
            type: 'textfield',
            key: 'bar.baz',
            label: 'Baz',
            defaultValue: '',
          },
        ]}
        onSubmit={vi.fn()}
      />
    );

    ref.current!.updateErrors({missingKey: 'Error not displayed anywhere'});

    const error = screen.getByText('Error not displayed anywhere');
    await expect.element(error).not.toBeInTheDocument();
  });

  test('Clear errors when the (leaf) value is set to undefined', async () => {
    const ref = createRef<FormStateRef>();
    let isValid: boolean = false;

    const IsValidObserver: React.FC = () => {
      const {isValid: isValidFormik} = useFormikContext();
      useEffect(() => {
        isValid = isValidFormik;
      }, [isValidFormik]);
      return null;
    };

    const screen = await render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp2',
            type: 'textfield',
            key: 'foo.bar.baz',
            label: 'Baz',
            defaultValue: '',
          },
          {
            id: 'comp3',
            type: 'editgrid',
            key: 'editgrid',
            label: 'Edit grid',
            disableAddingRemovingRows: false,
            groupLabel: 'Item',
            components: [
              {
                id: 'comp4',
                type: 'textfield',
                key: 'nestedTextfield',
                label: 'Nested textfield',
              },
            ],
          },
        ]}
        onSubmit={vi.fn()}
        values={{
          foo: {bar: {baz: ''}},
          editgrid: [{nestedTextfield: ''}],
        }}
      >
        <IsValidObserver />
      </Form>
    );

    const errorMsg1 = 'Visible foo.bar.baz error';
    const errorMsg2 = 'Visible editgrid error';
    // ensure that the error is visible first so that we can assert it no longer will be
    ref.current!.updateErrors({
      'foo.bar.baz': errorMsg1,
      'editgrid.0.nestedTextfield': errorMsg2,
    });
    await expect.element(screen.getByText(errorMsg1)).toBeVisible();
    await expect.element(screen.getByText(errorMsg2)).toBeVisible();

    // clear the error
    ref.current!.updateErrors({
      'foo.bar.baz': undefined,
      'editgrid.0.nestedTextfield': undefined,
    });
    await expect.element(screen.getByText(errorMsg1)).not.toBeInTheDocument();
    await expect.element(screen.getByText(errorMsg2)).not.toBeInTheDocument();
    expect(isValid).toBe(true);
  });
});

test('Modifying the form definition updates the validation schema', async () => {
  const onSubmit = vi.fn();
  const initial: TextFieldComponentSchema = {
    id: 'textfield',
    type: 'textfield',
    key: 'textfield',
    label: 'Textfield with max length',
    validate: {maxLength: 10},
  };
  const updated: TextFieldComponentSchema = {
    ...initial,
    validate: {maxLength: 3},
  };

  const TestComponent: React.FC = () => {
    const [components, setComponents] = useState<AnyComponentSchema[]>([initial]);
    return (
      <>
        <button onClick={() => setComponents([updated])}>Update component</button>
        <Form components={components} onSubmit={onSubmit} />
      </>
    );
  };

  const screen = await render(<TestComponent />);

  // initially validate the text field - 10 chars is okay
  const texfield = screen.getByLabelText('Textfield with max length');
  await texfield.fill('12345678901');

  const submitButton = screen.getByRole('button', {name: 'Submit'});
  await submitButton.click();
  await expect.element(screen.getByText('There are too many characters provided.')).toBeVisible();
  expect(onSubmit).not.toHaveBeenCalled();

  // correct the input and check that we can submit
  await texfield.clear();
  await texfield.fill('1234ab');
  await userEvent.tab();
  await submitButton.click();
  expect(onSubmit).toHaveBeenCalledWith({textfield: '1234ab'});

  // now update the component definition, which should update the validation schema
  await screen.getByRole('button', {name: 'Update component'}).click();
  const updatedTexfield = screen.getByLabelText('Textfield with max length');
  await expect.element(updatedTexfield).toHaveDisplayValue('1234ab');
  await submitButton.click();
  await expect.element(screen.getByText('There are too many characters provided.')).toBeVisible();
});

describe('onChange prop', () => {
  test('is called for changes because of user input', async () => {
    const onChange = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'comp1',
            type: 'textfield',
            key: 'foo',
            label: 'Foo',
            defaultValue: '',
          },
        ]}
        onChange={onChange}
        onSubmit={vi.fn()}
      />
    );
    const input = screen.getByLabelText('Foo');
    await expect.element(input).toBeVisible();

    await userEvent.type(input, 'Sample');

    expect(onChange).toHaveBeenCalledTimes(6); // once for each character
    expect(onChange).toHaveBeenLastCalledWith({foo: 'Sample'});
  });

  test('is called for changes from clearOnHide', async () => {
    const onChange = vi.fn();
    const screen = await render(
      <Form
        components={[
          {
            id: 'comp1',
            type: 'textfield',
            key: 'foo',
            label: 'Foo',
            defaultValue: '',
          },
          {
            id: 'comp2',
            type: 'email',
            key: 'email',
            label: 'Email',
            defaultValue: 'info@example.com',
            clearOnHide: true,
            conditional: {
              show: false,
              when: 'foo',
              eq: 'hide',
            },
          },
        ]}
        onChange={onChange}
        onSubmit={vi.fn()}
      />
    );

    const input = screen.getByLabelText('Foo');
    await expect.element(input).toBeVisible();
    await input.fill('hide');

    // we expect both the user input change and the calculated clearOnHide change
    expect(onChange).toHaveBeenCalledWith({foo: 'hide', email: 'info@example.com'});
    expect(onChange).toHaveBeenLastCalledWith({foo: 'hide'});
  });
});

describe('Regressions', () => {
  const NESTED_EDITGRIDS: EditGridComponentSchema = {
    id: 'outer',
    type: 'editgrid',
    key: 'outer',
    label: 'Outer',
    groupLabel: 'Outer item',
    disableAddingRemovingRows: true,
    components: [
      {
        id: 'inner',
        type: 'editgrid',
        key: 'inner',
        label: 'inner',
        groupLabel: 'Inner item',
        disableAddingRemovingRows: true,
        components: [
          {
            type: 'textfield',
            key: 'trigger',
            id: 'trigger',
            label: 'Checkbox',
          },
          {
            type: 'textfield',
            id: 'content2',
            key: 'content2',
            label: 'Not displayed 2',
            conditional: {
              show: false,
              when: 'outer.inner.trigger',
              eq: 'hide',
            },
          },
        ],
      },
    ],
  };

  test('Prevent infinite render loop with nested editgrids', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(err => {
      throw new Error(err);
    });
    const screen = await render(
      <Form
        components={[NESTED_EDITGRIDS]}
        values={{
          outer: [
            {
              inner: [
                {
                  trigger: 'hide',
                  content2: 'Hide me',
                },
              ],
            },
          ],
        }}
        onSubmit={vi.fn()}
      />
    );

    const editButton = screen.getByRole('button', {name: 'Edit item 1'});

    let error: Error | undefined = undefined;
    try {
      await editButton.click();
    } catch (e) {
      error = e;
      // if an error happens (which shouldn't be the case), make sure we're checking
      // for the right kind of error!
      expect(error!.message).toMatch(/Maximum update depth exceeded/);
    }

    expect(consoleErrorSpy.mock.calls).toHaveLength(0);
    expect(error).toBeUndefined();

    consoleErrorSpy.mockRestore();
  });

  test('Properly clears hidden fields in nested editgrids', async () => {
    const onSubmit = vi.fn();
    const screen = await render(
      <Form
        components={[NESTED_EDITGRIDS]}
        values={{
          outer: [
            {
              inner: [
                {
                  trigger: 'hide',
                  content2: 'Hide me',
                },
              ],
            },
          ],
        }}
        onSubmit={onSubmit}
      />
    );

    await screen.getByRole('button', {name: 'Submit'}).click();

    expect(onSubmit).toHaveBeenCalledWith({
      outer: [
        {
          inner: [{trigger: 'hide'}],
        },
      ],
    });
  });

  test.each([{clearOnHide: true}, {clearOnHide: false}])(
    'Prevent infinite render loop with hidden outer editgrid using clearOnHide=$clearOnHide',
    async ({clearOnHide}) => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(err => {
        throw new Error(err);
      });
      const screen = await render(
        <Form
          components={[
            {
              type: 'textfield',
              key: 'outerTrigger',
              id: 'outerTrigger',
              label: 'Outer trigger',
            },
            {
              id: 'outer',
              type: 'editgrid',
              key: 'outer',
              label: 'Outer',
              groupLabel: 'Outer item',
              disableAddingRemovingRows: true,
              clearOnHide: clearOnHide,
              components: [
                {
                  type: 'textfield',
                  key: 'textfield',
                  id: 'textfield',
                  label: 'Textfield',
                },
              ],
            } satisfies EditGridComponentSchema,
          ]}
          values={{
            outer: [
              {
                textfield: 'foo bat',
              },
            ],
          }}
          onSubmit={vi.fn()}
        />
      );

      const outerTrigger = screen.getByLabelText('Outer trigger');

      let error: Error | undefined = undefined;
      // Hiding the edit-grid shouldn't cause any errors.
      // And turning the edit-grid back to visible, shouldn't cause any errors either.
      try {
        await outerTrigger.fill('hide');
        await outerTrigger.clear();
      } catch (e) {
        error = e;
        // if an error happens (which shouldn't be the case), make sure we're checking
        // for the right kind of error!
        expect(error!.message).toMatch(/Maximum update depth exceeded/);
      }

      expect(consoleErrorSpy.mock.calls).toHaveLength(0);
      expect(error).toBeUndefined();

      consoleErrorSpy.mockRestore();
    }
  );

  test.each([{clearOnHide: true}, {clearOnHide: false}])(
    'Prevent infinite render loop with hidden inner editgrid using clearOnHide=$clearOnHide',
    async ({clearOnHide}) => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(err => {
        throw new Error(err);
      });
      const screen = await render(
        <Form
          components={[
            {
              type: 'textfield',
              key: 'outerTrigger',
              id: 'outerTrigger',
              label: 'Outer trigger',
            },
            {
              id: 'outer',
              type: 'editgrid',
              key: 'outer',
              label: 'Outer',
              groupLabel: 'Outer item',
              disableAddingRemovingRows: true,
              components: [
                {
                  id: 'inner',
                  type: 'editgrid',
                  key: 'inner',
                  label: 'Inner',
                  groupLabel: 'Inner item',
                  disableAddingRemovingRows: true,
                  clearOnHide: clearOnHide,
                  components: [
                    {
                      type: 'textfield',
                      key: 'textfield',
                      id: 'textfield',
                      label: 'Textfield',
                    },
                  ],
                } satisfies EditGridComponentSchema,
              ],
            } satisfies EditGridComponentSchema,
          ]}
          values={{
            outer: [
              {
                inner: [
                  {
                    textfield: 'foo bat',
                  },
                ],
              },
            ],
          }}
          onSubmit={vi.fn()}
        />
      );

      const outerTrigger = screen.getByLabelText('Outer trigger');

      let error: Error | undefined = undefined;
      // Hiding the edit-grid shouldn't cause any errors.
      // And turning the edit-grid back to visible, shouldn't cause any errors either.
      try {
        await outerTrigger.fill('hide');
        await outerTrigger.clear();
      } catch (e) {
        error = e;
        // if an error happens (which shouldn't be the case), make sure we're checking
        // for the right kind of error!
        expect(error!.message).toMatch(/Maximum update depth exceeded/);
      }

      expect(consoleErrorSpy.mock.calls).toHaveLength(0);
      expect(error).toBeUndefined();

      consoleErrorSpy.mockRestore();
    }
  );
});
