import type {CustomerProfileComponentSchema} from '@open-formulieren/types';
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
    <FormioForm
      {...props}
      id="test-form"
      requiredFieldsWithAsterisk
      componentParameters={{
        customerProfile: {
          fetchDigitalAddresses: async () => [],
          portalUrl: '',
          updatePreferencesModalEnabled: false,
        },
      }}
    />
    <button type="submit" form="test-form">
      Submit
    </button>
  </IntlProvider>
);

// regression test for https://github.com/open-formulieren/open-forms/issues/6558
test('required customer profile validation state resets on input', async () => {
  const onSubmit = vi.fn();
  const component: CustomerProfileComponentSchema = {
    id: 'customerProfile',
    type: 'customerProfile',
    key: 'customerProfile',
    label: 'Profile',
    digitalAddressTypes: ['email', 'phoneNumber'],
    validate: {required: true},
    shouldUpdateCustomerData: false,
  };
  const screen = await render(<Form components={[component]} onSubmit={onSubmit} />);

  // trigger the (rightful) validation error by submitting with empty fields
  await screen.getByRole('button', {name: 'Submit'}).click();
  const errorMessage = 'At least one digital address should be provided.';
  expect(screen.getByText(errorMessage)).toBeVisible();
  expect(onSubmit).not.toHaveBeenCalled();

  // Enter a digital address and assert that the form can be submitted.
  await screen.getByLabelText('Email', {exact: true}).fill('info@example.com');
  // Shift focus
  await screen.getByLabelText('Phone number', {exact: true}).click();
  expect(screen.getByText(errorMessage)).not.toBeInTheDocument();
  await screen.getByRole('button', {name: 'Submit'}).click();
  expect(onSubmit).toHaveBeenCalledOnce();
});
