import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {createRef, forwardRef} from 'react';
import {IntlProvider} from 'react-intl';
import {describe, expect, test, vi} from 'vitest';

import FormioForm, {FormStateRef, type FormioFormProps} from './FormioForm';

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
    ref.current?.updateValues({foo: 'bar'});
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

    ref.current?.updateValues({foo: 'updated'});
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

    ref.current?.updateValues({parent: {nested2: 'updated'}});

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

    ref.current?.updateValues({parent: {nested1: 'changed', nested2: 'changed2'}});

    await userEvent.click(screen.getByRole('button', {name: 'Submit'}));
    expect(onSubmit).toHaveBeenCalledWith({
      parent: {
        nested1: 'changed',
        nested2: 'changed2',
      },
    });
  });
});
