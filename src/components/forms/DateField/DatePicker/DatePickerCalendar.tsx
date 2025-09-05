// Calendar component documentation:
// https://nl-design-system.github.io/utrecht/storybook-react/index.html?path=/docs/react-component-calendar--docs
import {Calendar} from '@utrecht/component-library-react';
import type {Locale} from 'date-fns';
import {FormattedMessage, useIntl} from 'react-intl';
import {useAsync} from 'react-use';

/**
 * Dynamically import the calendar locale.
 */
const loadCalendarLocale = async (locale: string): Promise<Locale> => {
  switch (locale) {
    case 'nl':
      const {default: nl} = await import('date-fns/locale/nl');
      return nl;
    case 'en':
    default:
      const {default: en} = await import('date-fns/locale/en-GB');
      return en;
  }
};

const DatePickerCalendar: typeof Calendar = props => {
  const intl = useIntl();

  // Load the calendar locale
  const {
    loading,
    value: locale,
    error,
  } = useAsync(async () => {
    return await loadCalendarLocale(intl.locale);
  }, [intl.locale]);

  if (loading) {
    return <FormattedMessage description="Calendar loading message" defaultMessage="Loading..." />;
  }
  if (error) {
    throw error;
  }

  return (
    <Calendar
      locale={locale}
      previousYearButtonTitle={intl.formatMessage({
        description: 'Calendar: previous year button title',
        defaultMessage: 'Previous year',
      })}
      nextYearButtonTitle={intl.formatMessage({
        description: 'Calendar: next year button title',
        defaultMessage: 'Next year',
      })}
      previousMonthButtonTitle={intl.formatMessage({
        description: 'Calendar: previous month button title',
        defaultMessage: 'Previous month',
      })}
      nextMonthButtonTitle={intl.formatMessage({
        description: 'Calendar: next month button title',
        defaultMessage: 'Next month',
      })}
      {...props}
    />
  );
};

export default DatePickerCalendar;
