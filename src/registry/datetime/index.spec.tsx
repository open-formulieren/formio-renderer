import type {DateTimeComponentSchema} from '@open-formulieren/types';
import {IntlProvider} from 'react-intl';
import {afterEach, beforeEach, expect, test, vi} from 'vitest';
import {render} from 'vitest-browser-react';

import FormioForm from '@/components/FormioForm';
import type {FormioFormProps} from '@/components/FormioForm';

type FormProps = Pick<FormioFormProps, 'components' | 'onSubmit' | 'values'>;

const Form: React.FC<FormProps> = props => (
  <IntlProvider locale="en" messages={{}}>
    <FormioForm {...props} id="test-form" requiredFieldsWithAsterisk />
    <button type="submit" form="test-form">
      Submit
    </button>
  </IntlProvider>
);

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

test.each([
  ['', '2020-01-01', 'January 2020'],
  ['', '2040-01-01', 'July 2026'],
  ['2010-01-01', '', 'July 2026'],
  ['2040-01-01', '', 'January 2040'],
  ['2010-01-01', '2020-01-01', 'January 2020'],
  ['2040-01-01', '2050-01-01', 'January 2040'],
  ['2010-01-01', '2050-01-01', 'July 2026'],
])(
  'initial date picker date uses closest available option (minDate: %s, maxDate: %s)',
  async (minDate: string, maxDate: string, needle: string) => {
    vi.setSystemTime(new Date(2026, 6, 1, 16));
    const onSubmit = vi.fn();
    const component: DateTimeComponentSchema = {
      id: 'datetime',
      type: 'datetime',
      key: 'datetime',
      label: 'Datetime',
      datePicker: {
        minDate: minDate,
        maxDate: maxDate,
      },
    };

    const screen = await render(<Form components={[component]} onSubmit={onSubmit} />);

    await screen.getByRole('button', {name: 'Toggle calendar'}).click();
    await expect.element(screen.getByRole('dialog')).toBeVisible();
    await expect.element(screen.getByText(needle), {timeout: 3000}).toBeVisible();
  }
);
