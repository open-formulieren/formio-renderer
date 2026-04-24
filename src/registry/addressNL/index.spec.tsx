import type {AddressNLComponentSchema, CheckboxComponentSchema} from '@open-formulieren/types';
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

test('addressNL can be conditionally displayed', async () => {
  const components = [
    {
      id: 'checkbox',
      type: 'checkbox',
      key: 'checkbox',
      label: 'Show addressNL?',
      defaultValue: false,
    } satisfies CheckboxComponentSchema,
    {
      id: 'addressNL',
      type: 'addressNL',
      key: 'addressNL',
      label: 'Dynamically displayed address',
      layout: 'singleColumn',
      deriveAddress: false,
      hidden: true,
      conditional: {
        show: true,
        when: 'checkbox',
        eq: true,
      },
    } satisfies AddressNLComponentSchema,
  ];

  const screen = await render(<Form components={components} onSubmit={vi.fn()} />);

  const trigger = screen.getByLabelText('Show addressNL?');
  await expect.element(trigger).toBeVisible();
  await trigger.click();

  await expect.element(screen.getByText('Dynamically displayed address')).toBeVisible();
  await expect.element(screen.getByLabelText('Postcode')).toBeVisible();
  await expect.element(screen.getByLabelText('House number', {exact: true})).toBeVisible();
});
