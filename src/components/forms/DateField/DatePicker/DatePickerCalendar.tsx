// Calendar component documentation:
// https://nl-design-system.github.io/utrecht/storybook-react/index.html?path=/docs/react-component-calendar--docs
import {Calendar} from '@utrecht/component-library-react';
import {enGB, nl} from 'date-fns/locale';
import {useIntl} from 'react-intl';

// FIXME: together with src/i18n.js, see how we can make this a dynamic import without
//  breaking the bundles/cache busting mechanisms.
export const loadCalendarLocale = (locale: string) => {
  switch (locale) {
    case 'nl':
      return nl;
    default:
      return enGB;
  }
};

const DatePickerCalendar: typeof Calendar = props => {
  const locale = useCalendarLocale();
  const {formatMessage} = useIntl();
  return (
    <Calendar
      locale={locale}
      previousYearButtonTitle={formatMessage({
        description: 'Calendar: previous year button title',
        defaultMessage: 'Previous year',
      })}
      nextYearButtonTitle={formatMessage({
        description: 'Calendar: next year button title',
        defaultMessage: 'Next year',
      })}
      previousMonthButtonTitle={formatMessage({
        description: 'Calendar: previous month button title',
        defaultMessage: 'Previous month',
      })}
      nextMonthButtonTitle={formatMessage({
        description: 'Calendar: next month button title',
        defaultMessage: 'Next month',
      })}
      {...props}
    />
  );
};

export const useCalendarLocale = () => {
  const intl = useIntl();
  return loadCalendarLocale(intl.locale);
};

export default DatePickerCalendar;
