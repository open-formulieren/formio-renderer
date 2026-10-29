import type {SelectboxesComponentSchema} from '@open-formulieren/types';
import {IntlProvider} from 'react-intl';
import {expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';

import FormioForm from '@/components/FormioForm';
import type {FormioFormProps} from '@/components/FormioForm';

type FormProps = Pick<
  FormioFormProps,
  'components' | 'onChange' | 'onSubmit' | 'values' | 'children'
>;

const Form: React.FC<FormProps> = props => (
  <IntlProvider locale="en" messages={{}}>
    <FormioForm {...props} id="test-form" requiredFieldsWithAsterisk />
    <button type="submit" form="test-form">
      Submit
    </button>
  </IntlProvider>
);

// Regression test for open-formulieren/open-forms#6880
test('numeric values for options do not display partial error messages on individual checkboxes', async () => {
  const component: SelectboxesComponentSchema = {
    id: 'selectboxes',
    type: 'selectboxes',
    key: 'selectboxes',
    label: 'Numeric values',
    values: [
      {value: '1', label: '1'},
      {value: '2', label: 'foo'},
    ],
    defaultValue: {'1': false, '2': false},
    validate: {
      required: true,
    },
    openForms: {
      dataSrc: 'manual',
      translations: {},
    },
  };

  const screen = await render(<Form components={[component]} onSubmit={vi.fn()} />);

  const selectboxesLabel = screen.getByText('Numeric values');
  await expect.element(selectboxesLabel).toBeVisible();

  await screen.getByRole('button', {name: 'Submit'}).click();

  // Expect the main selectboxes error message to be shown
  await expect
    .element(screen.getByText('The required field Numeric values must be filled in.'))
    .toBeVisible();
  // Don't expect individual error messages per individual checkbox
  await expect.element(screen.getByText('h', {exact: true})).not.toBeInTheDocument();
  await expect.element(screen.getByText('e', {exact: true})).not.toBeInTheDocument();
});
