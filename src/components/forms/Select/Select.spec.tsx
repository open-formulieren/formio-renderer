import {Form, Formik} from 'formik';
import {IntlProvider} from 'react-intl';
import {expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';
import {userEvent} from 'vitest/browser';

import Select from './Select';

test('clearing select variants', async () => {
  const onSubmit = vi.fn();
  const screen = await render(
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
  await expect.element(select1).toBeVisible();
  const select2 = screen.getByLabelText('Select 2');
  await expect.element(select2).toBeVisible();

  // clear select 1
  await select1.click();
  await userEvent.keyboard('{Backspace}');
  await userEvent.keyboard('{Escape}');
  // clear select 2
  await select2.click();
  await userEvent.keyboard('{Backspace}');
  await userEvent.keyboard('{Escape}');

  await screen.getByRole('button', {name: 'Submit'}).click();

  expect(onSubmit).toHaveBeenCalledExactlyOnceWith({
    select2: '',
  });
});
