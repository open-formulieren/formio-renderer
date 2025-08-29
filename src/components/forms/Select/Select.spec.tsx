import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Form, Formik} from 'formik';
import {IntlProvider} from 'react-intl';
import selectEvent from 'react-select-event';
import {expect, test, vi} from 'vitest';

import Select from './Select';

// This test produces `act` warnings, most likely due to react-select-event being a bit
// outdated:
//   Warning: The current testing environment is not configured to support act(...)
test('clearing select variants', async () => {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(
    <IntlProvider locale="en" messages={{}}>
      <Formik
        onSubmit={values => onSubmit(values)}
        initialValues={{select1: 'option-1', select2: 'option-1'}}
      >
        <Form>
          <Select
            name="select1"
            label="Select 1"
            options={[
              {value: 'option-1', label: 'Option 1'},
              {value: 'option-2', label: 'Option 2'},
            ]}
            noOptionSelectedValue={undefined}
          />
          <Select
            name="select2"
            label="Select 2"
            options={[
              {value: 'option-1', label: 'Option 1'},
              {value: 'option-2', label: 'Option 2'},
            ]}
            noOptionSelectedValue={''}
          />
          <button type="submit">Submit</button>
        </Form>
      </Formik>
    </IntlProvider>
  );

  const select1 = screen.getByLabelText('Select 1');
  expect(select1).toBeVisible();
  const select2 = screen.getByLabelText('Select 2');
  expect(select2).toBeVisible();

  await selectEvent.clearFirst(select1);
  await selectEvent.clearFirst(select2);
  await user.click(screen.getByRole('button', {name: 'Submit'}));

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
    select2: '',
  });
});
