import {Paragraph, Textbox} from '@utrecht/component-library-react';
import {formatISO} from 'date-fns';
import {useField, useFormikContext} from 'formik';
import {useEffect, useId, useState} from 'react';
import {flushSync} from 'react-dom';
import {useIntl} from 'react-intl';

import {FloatingWidget, useFloatingWidget} from '@/components/forms/FloatingWidget';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import Icon from '@/components/icons';

import './DatePicker.scss';
import DatePickerCalendar from './DatePickerCalendar';
import {useDateLocaleMeta} from './hooks';
import {PART_PLACEHOLDERS} from './messages';
import {parseDateTime} from './utils';

interface DateTimePickerProps {
  /**
   * The name of the form field/input, used to set/track the field value in the form state.
   */
  name: string;
  /**
   * The (accessible) label for the field - anything that can be rendered.
   *
   * You must always provide a label to ensure the field is accessible to users of
   * assistive technologies.
   */
  label: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  /**
   * Required fields get additional markup/styling to indicate this validation requirement.
   */
  isRequired?: boolean;
  /**
   * Disabled fields get marked as such in an accessible manner.
   */
  isDisabled?: boolean;
  'aria-describedby'?: string;
  /**
   * Dates before this value will be unavailable for selection.
   */
  minDate?: Date;
  /**
   * Dates after this value will be unavailable for selection.
   */
  maxDate?: Date;
  /**
   * An array of ISO-8601 (YYYY-MM-DD) date strings, representing not-available dates.
   */
  disabledDates?: string[];
}

interface DateTimePartValues {
  date: string;
  time: string;
}
type DateTimePart = keyof DateTimePartValues;
const dateObjectToParts = (datetime: Date | null): DateTimePartValues => {
  if (!datetime) return {date: '', time: ''};

  // Do not get the date and time using `toISOString()`, as it always returns UTC time. We create
  // date objects without timezone information, which sets it to Amsterdam time automatically. So
  // day shifts will occur when the time is close to midnight.
  const year = String(datetime.getFullYear());
  // Note: getMonth() returns the month index, so add 1
  const month = String(datetime.getMonth() + 1).padStart(2, '0');
  const day = String(datetime.getDate()).padStart(2, '0');
  const hour = String(datetime.getHours()).padStart(2, '0');
  const minute = String(datetime.getMinutes()).padStart(2, '0');
  return {
    date: [year, month, day].join('-'),
    time: [hour, minute].join(':'),
  };
};

/**
 * Implements a form field to select dates.
 *
 * For accessibility reasons, there should always be a text field allowing users to
 * manually type in the date time. However, when the field is focused, this toggles the
 * calendar where a date can be selected using a pointer device.
 *
 * Note: currently we only support the 24-hour format for the time. If we want to support AM/PM
 * notation, we need to extend our custom parser to convert the textbox value to a (valid)
 * ISO-8601 string.
 */
const DateTimePicker: React.FC<DateTimePickerProps> = ({
  name,
  label,
  tooltip,
  isRequired,
  isDisabled,
  'aria-describedby': ariaDescribedBy,
  minDate,
  maxDate,
  disabledDates,
}) => {
  const id = useId();
  const {formatDate, formatMessage} = useIntl();
  const {validateField} = useFormikContext();
  const [{value, onBlur, onChange}, {error, touched}, {setTouched, setValue}] =
    useField<string>(name);
  const {
    refs,
    floatingStyles,
    context,
    getFloatingProps,
    getReferenceProps,
    isOpen,
    setIsOpen,
    arrowRef,
  } = useFloatingWidget();
  const dateLocaleMeta = useDateLocaleMeta();

  // Create placeholder
  const placeholderMap = {
    day: formatMessage(PART_PLACEHOLDERS.day),
    month: formatMessage(PART_PLACEHOLDERS.month),
    year: formatMessage(PART_PLACEHOLDERS.year),
    hour: formatMessage(PART_PLACEHOLDERS.hour),
    minute: formatMessage(PART_PLACEHOLDERS.minute),
  };
  const datePlaceholder = dateLocaleMeta.partsOrder
    .map(part => placeholderMap[part])
    .join(dateLocaleMeta.separator);
  const placeholder = `${datePlaceholder} ${placeholderMap.hour}:${placeholderMap.minute}`;

  // Value could be anything, but we only try to parse as an ISO-8601 string, because this is what
  // we set to the field on blur if the date was correctly parsed using the locale meta.
  const currentDateTime = parseDateTime(value);
  const dateTimePartsFromValue = dateObjectToParts(currentDateTime);
  const [{date, time}, setDateTimeParts] = useState<DateTimePartValues>(dateTimePartsFromValue);

  // Synchronize with external changes if we have a value and our date parts don't
  // reflect it
  useEffect(
    () => {
      const shouldIgnore = currentDateTime === null && (date === '' || time === '');
      const newValueParts = dateObjectToParts(currentDateTime);

      const isInconsistent = newValueParts.date !== date || newValueParts.time !== time;
      if (isInconsistent && !shouldIgnore) {
        setDateTimeParts(newValueParts);
      }
    },
    // we deliberately exclude date and time from the dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDateTime]
  );

  const onPartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // we must cast here since we can't pass the valid input names as a generic.
    const name = event.target.name as DateTimePart;
    const value = event.target.value;

    // update the state of the individual parts
    const newDateParts = {date, time, [name]: value};
    setDateTimeParts(newDateParts);

    if (newDateParts.date === '' || newDateParts.time === '') {
      // If one part is missing, treat as if the entire field was cleared.
      setValue('');
    } else {
      // If we have both parts, we can combine them into an ISO-8601 string. This is possible,
      // because the date picker and time input return a date and time ISO-8601 string,
      // respectively.
      setValue(`${newDateParts.date}T${newDateParts.time}:00`);
    }
  };

  // If we have a date object, format it according to the locale (and remove comma) and use as the
  // textbox value. Otherwise, just use the field value directly.
  // Note: cannot use `timeStyle: 'short'` here, because it will add AM/PM for English locale.
  const textboxValue =
    currentDateTime !== null
      ? formatDate(currentDateTime, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: false,
        }).replace(',', '')
      : value;

  const calendarEvents: React.ComponentProps<typeof DatePickerCalendar>['events'] = disabledDates
    ? disabledDates.map(date => ({
        date: date,
        emphasis: false,
        selected: false,
        disabled: true,
      }))
    : undefined;

  const referenceProps = getReferenceProps();
  return (
    <>
      <Label
        id={id}
        isRequired={isRequired}
        isDisabled={isDisabled}
        tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>
      <Paragraph className="openforms-datepicker-textbox">
        <Textbox
          name={name}
          value={textboxValue}
          onChange={onChange}
          onBlur={async event => {
            const value = event.target.value;
            // Attempt to create a date object using the locale meta
            const date = parseDateTime(value, dateLocaleMeta);
            // If we were able to create a date object, format it to an ISO-8601 string and set it
            // as the field value. Otherwise, just set the entered value to the field directly.
            // It's up to the validation libraries to check it.
            const newValue = date
              ? formatISO(date, {representation: 'complete'}).slice(0, 19) // remove TZ info
              : value;
            await setValue(newValue);
            onBlur(event);
            await validateField(name);
          }}
          className="utrecht-textbox--openforms"
          id={id}
          disabled={isDisabled}
          invalid={touched && !!error}
          aria-describedby={ariaDescribedBy}
          placeholder={placeholder}
          ref={refs.setReference}
          autoComplete="off"
          {...referenceProps}
        />
        <Icon
          icon="calendar"
          className="openforms-datepicker-textbox__calendar-toggle"
          aria-label={formatMessage({
            description: 'Datepicker: accessible calendar toggle label',
            defaultMessage: 'Toggle calendar',
          })}
          aria-hidden="false"
          aria-controls={referenceProps['aria-controls']}
          aria-expanded={referenceProps['aria-expanded']}
          aria-haspopup={referenceProps['aria-haspopup']}
          onClick={() => !isOpen && setIsOpen(true)}
        />
      </Paragraph>
      <FloatingWidget
        isOpen={isOpen}
        context={context}
        setFloating={refs.setFloating}
        floatingStyles={floatingStyles}
        getFloatingProps={getFloatingProps}
        arrowRef={arrowRef}
      >
        <DatePickerCalendar
          onCalendarClick={async selectedDate => {
            flushSync(() => {
              // Need to truncate, because the selected date is in datetime format
              const truncated = selectedDate.substring(0, 10);
              const e = {
                target: {name: 'date', value: truncated},
              } as React.ChangeEvent<HTMLInputElement>;
              onPartChange(e);
            });
            await setTouched(true);
          }}
          currentDate={currentDateTime ?? undefined}
          minDate={minDate}
          maxDate={maxDate}
          events={calendarEvents}
        />
        <Textbox
          type="time"
          step="60" // Ensures no seconds are displayed
          aria-label="time"
          name="time"
          onChange={onPartChange}
          value={time}
        />
      </FloatingWidget>
    </>
  );
};

export default DateTimePicker;
