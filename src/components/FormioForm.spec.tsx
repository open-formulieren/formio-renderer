import {act, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef, forwardRef} from 'react';
import {IntlProvider} from 'react-intl';
import {describe, expect, test, vi} from 'vitest';

import FormioForm, {type FormStateRef, type FormioFormProps} from './FormioForm';

type FormProps = Pick<FormioFormProps, 'components' | 'onSubmit'>;

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

  test('Supports removing field values via undefined', async () => {
    const onSubmit = vi.fn();
    const ref = createRef<FormStateRef>();
    render(
      <Form
        ref={ref}
        components={[
          {
            id: 'comp1',
            type: 'textfield',
            key: 'parent.nested',
            label: 'Foo',
            defaultValue: 'foo',
          },
          {
            id: 'comp2',
            type: 'textfield',
            key: 'foo',
            label: 'Bar',
            defaultValue: 'bar',
          },
          {
            id: 'comp3',
            type: 'textfield',
            key: 'cleared',
            label: 'To be cleared',
            defaultValue: 'not empty',
          },
        ]}
        onSubmit={onSubmit}
      />
    );

    ref.current!.updateValues({
      parent: {nested: undefined},
      foo: undefined,
      cleared: '',
    });

    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(screen.getByLabelText('Foo')).toHaveDisplayValue('');
    expect(screen.getByLabelText('Bar')).toHaveDisplayValue('');
    // matches Formio's clearOnHide behaviour (!)
    expect(onSubmit).toHaveBeenCalledWith({parent: {}, cleared: ''});
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
