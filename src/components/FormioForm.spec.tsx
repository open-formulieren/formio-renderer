import type {
  AnyComponentSchema,
  EditGridComponentSchema,
  TextFieldComponentSchema,
} from '@open-formulieren/types';
import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef, forwardRef, useState} from 'react';
import {IntlProvider} from 'react-intl';
import {describe, expect, test, vi} from 'vitest';

import FormioForm from './FormioForm';
import type {FormStateRef, FormioFormProps} from './FormioForm';

type FormProps = Pick<FormioFormProps, 'components' | 'onChange' | 'onSubmit' | 'values'>;

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
    render(
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

    const input = await screen.findByLabelText('Foo');
    expect(input).toBeVisible();
    expect(input).toHaveDisplayValue('');

    // now mutate the form values and check that the state updates accordingly
    ref.current!.updateValues({foo: 'bar'});
    await waitFor(() => {
      expect(input).toHaveDisplayValue('bar');
    });

    // and values should be reflected accordingly on submission
    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalledWith({foo: 'bar'});
  });

  test('Supports partial updates', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    render(
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

    const fooInput = await screen.findByLabelText('Foo');
    expect(fooInput).toBeVisible();
    expect(fooInput).toHaveDisplayValue('');

    const barInput = await screen.findByLabelText('Bar');
    expect(barInput).toBeVisible();
    expect(barInput).toHaveDisplayValue('Bar');

    ref.current!.updateValues({foo: 'updated'});
    await waitFor(() => {
      expect(fooInput).toHaveDisplayValue('updated');
      expect(barInput).toHaveDisplayValue('Bar');
    });

    // and values should be reflected accordingly on submission
    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalledWith({
      foo: 'updated',
      bar: 'Bar',
    });
  });

  test('Supports partial deep updates', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    render(
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

    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
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
    render(
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

    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
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
    render(
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
    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalledWith({editgrid: [{name: 'Initial'}]});

    ref.current!.updateValues({editgrid: [{name: 'Updated'}, {name: 'New'}]});

    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalledWith({editgrid: [{name: 'Updated'}, {name: 'New'}]});
  });

  test('Update whole editgrid value to remove an item', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    render(
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
    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalledWith({editgrid: [{name: 'First'}, {name: 'Second'}]});

    // remove the first item
    ref.current!.updateValues({editgrid: [{name: 'Second'}]});

    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalledWith({editgrid: [{name: 'Second'}]});
  });

  test('Can replace individual editgrid items', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    render(
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

    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
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
    render(
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

    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalledWith({
      editgrid: [
        {name: 'Updated', other: 'Other 1'},
        {name: 'Initial 2', other: 'Other 2'},
      ],
    });
  });
});

describe('Updating form errors', () => {
  test('Display flat and deep nested errors', async () => {
    const ref = createRef<FormStateRef>();
    render(
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

    expect(await screen.findByText('Visible foo error')).toBeVisible();
    expect(await screen.findByText('Visible bar.baz error')).toBeVisible();
  });

  test('Display dotted key errors', async () => {
    const ref = createRef<FormStateRef>();
    render(
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

    expect(await screen.findByText('Visible bar.baz error')).toBeVisible();
  });

  test('Ignore invalid key errors', async () => {
    const ref = createRef<FormStateRef>();
    render(
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

    await act(() => {
      ref.current!.updateErrors({missingKey: 'Error not displayed anywhere'});
    });

    await waitFor(() => {
      const error = screen.queryByText('Error not displayed anywhere');
      expect(error).not.toBeInTheDocument();
    });
  });
});

test('Modifying the form definition updates the validation schema', async () => {
  const user = userEvent.setup();
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

  render(<TestComponent />);

  // initially validate the text field - 10 chars is okay
  const texfield = await screen.findByLabelText('Textfield with max length');
  const submitButton = screen.getByRole('button', {name: 'Submit'});
  await user.type(texfield, '12345678901');
  await user.click(submitButton);
  expect(await screen.findByText('There are too many characters provided.')).toBeVisible();
  expect(onSubmit).not.toHaveBeenCalled();

  // correct the input and check that we can submit
  await user.clear(texfield);
  await user.type(texfield, '1234ab');
  await user.click(submitButton);
  expect(onSubmit).toHaveBeenCalledWith({textfield: '1234ab'});

  // now update the component definition, which should update the validation schema
  await user.click(screen.getByRole('button', {name: 'Update component'}));
  const updatedTexfield = await screen.findByLabelText('Textfield with max length');
  expect(updatedTexfield).toHaveDisplayValue('1234ab');
  await user.click(submitButton);
  expect(await screen.findByText('There are too many characters provided.')).toBeVisible();
});

describe('onChange prop', () => {
  test('is called for changes because of user input', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
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
    const input = await screen.findByLabelText('Foo');
    expect(input).toBeVisible();

    await user.type(input, 'Sample');

    expect(onChange).toBeCalledTimes(6); // once for each character
    expect(onChange).toHaveBeenLastCalledWith({foo: 'Sample'});
  });

  test('is called for changes from clearOnHide', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
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
            validateOn: 'blur',
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

    const input = await screen.findByLabelText('Foo');
    expect(input).toBeVisible();
    await user.type(input, 'hide');

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
    render(
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

    const editButton = await screen.findByRole('button', {name: 'Edit item 1'});

    let error: Error | undefined = undefined;
    try {
      await userEvent.click(editButton);
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
    render(
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

    await userEvent.click(await screen.findByRole('button', {name: 'Submit'}));

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
      render(
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
              conditional: {
                show: false,
                when: 'outerTrigger',
                eq: 'hide',
              },
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

      const outerTrigger = await screen.findByLabelText('Outer trigger');

      let error: Error | undefined = undefined;
      // Hiding the edit-grid shouldn't cause any errors.
      // And turning the edit-grid back to visible, shouldn't cause any errors either.
      try {
        await userEvent.type(outerTrigger, 'hide');
        await userEvent.clear(outerTrigger);
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
      render(
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
                  conditional: {
                    show: false,
                    when: 'outerTrigger',
                    eq: 'hide',
                  },
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

      const outerTrigger = await screen.findByLabelText('Outer trigger');

      let error: Error | undefined = undefined;
      // Hiding the edit-grid shouldn't cause any errors.
      // And turning the edit-grid back to visible, shouldn't cause any errors either.
      try {
        await userEvent.type(outerTrigger, 'hide');
        await userEvent.clear(outerTrigger);
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
