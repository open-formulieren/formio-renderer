import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {IntlProvider} from 'react-intl';
import {expect, test, vi} from 'vitest';

import FormioForm, {type FormioFormProps} from '@/components/FormioForm';

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
