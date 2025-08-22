// Calendar component documentation:
// https://nl-design-system.github.io/utrecht/storybook-react/index.html?path=/docs/react-component-calendar--docs
import {Calendar} from '@utrecht/component-library-react';
import {enGB, nl} from 'date-fns/locale';
import {FormattedMessage, useIntl} from 'react-intl';

// FIXME: together with src/i18n.js, see how we can make this a dynamic import without
// breaking the bundles/cache busting mechanisms.
export const loadCalendarLocale = (locale: string) => {
  switch (locale) {
    case 'nl':
      return nl;
    default:
      return enGB;
  }
};

type CalendarProps = React.ComponentProps<typeof Calendar>;

const DatePickerCalendar: React.FC<CalendarProps> = props => {
  const locale = useCalendarLocale();
  return (
    <Calendar
      locale={locale}
      previousYearButtonTitle={
        <FormattedMessage
          description="Calendar: previous year button title"
          defaultMessage="Previous year"
        />
      }
      nextYearButtonTitle={
        <FormattedMessage
          description="Calendar: next year button title"
          defaultMessage="Next year"
        />
      }
      previousMonthButtonTitle={
        <FormattedMessage
          description="Calendar: previous month button title"
          defaultMessage="Previous month"
        />
      }
      nextMonthButtonTitle={
        <FormattedMessage
          description="Calendar: next month button title"
          defaultMessage="Next month"
        />
      }
      {...props}
    />
  );
};

export const useCalendarLocale = () => {
  const intl = useIntl();
  return loadCalendarLocale(intl.locale);
};

export default DatePickerCalendar;
