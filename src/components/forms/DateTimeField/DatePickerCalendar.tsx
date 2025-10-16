// Calendar component documentation:
// https://nl-design-system.github.io/utrecht/storybook-react/index.html?path=/docs/react-component-calendar--docs
import {Calendar} from '@utrecht/component-library-react';
import type {Locale} from 'date-fns';
import {useEffect, useState} from 'react';
import {useIntl} from 'react-intl';

/**
 * Dynamically import the calendar locale.
 */
const loadCalendarLocale = async (locale: string): Promise<Locale> => {
  switch (locale) {
    case 'nl': {
      const {default: nl} = await import('date-fns/locale/nl');
      return nl;
    }
    case 'en':
    default: {
      const {default: en} = await import('date-fns/locale/en-GB');
      return en;
    }
  }
};

const DatePickerCalendar: typeof Calendar = props => {
  const intl = useIntl();
  const [calendarLocale, setCalendarLocale] = useState<Locale | null>(null);

  // Load the calendar locale
  useEffect(() => {
    let isMounted = true;
    const loadLocale = async () => {
      const calendarLocale = await loadCalendarLocale(intl.locale);
      if (isMounted) setCalendarLocale(calendarLocale);
    };
    loadLocale();

    return () => {
      isMounted = false;
    };
  }, [intl.locale]);

  // Loading times should be short so we can just return null instead of a loading
  // message/indicator.
  if (!calendarLocale) return null;

  return (
    <Calendar
      locale={calendarLocale}
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
