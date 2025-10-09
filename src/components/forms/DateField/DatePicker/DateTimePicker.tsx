import { Paragraph, Textbox } from '@utrecht/component-library-react';
import { formatISO } from 'date-fns';
import { useField, useFormikContext } from 'formik';
import { useEffect, useId, useState } from 'react';
import { flushSync } from 'react-dom';
import { useIntl } from 'react-intl';



import { FloatingWidget, useFloatingWidget } from '@/components/forms/FloatingWidget';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import Icon from '@/components/icons';



import { useDateLocaleMeta } from '../hooks';
import { PART_PLACEHOLDERS } from '../messages';
import { parseDateTime, partsToUnvalidatedISO8601 } from '../utils';
import './DatePicker.scss';
import DatePickerCalendar from './DatePickerCalendar';





// TODO-83: combine with DatePicker?
interface DatePickerProps {
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
  hour: string;
  minute: string;
}
type DateTimePart = keyof DateTimePartValues;
const dateObjectToParts = (date: Date | null): DateTimePartValues => {
  if (!date) return {date: '', hour: '', minute: ''};

  return {
    date: String(date.toISOString().split('T')),
    hour: String(date.getHours()),
    minute: String(date.getMinutes()),
  };
};

/**
 * Implements a form field to select dates.
 *
 * For accessibility reasons, there should always be a text field allowing users to
 * manually type in the date. However, when the field is focused, this toggles the
 * calendar where a date can be selected using a pointer device.
 *
 * TODO: on mobile devices, use the native date picker?
 */
const DateTimePicker: React.FC<DatePickerProps> = ({
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
    // TODO-83: translations
    hour: 'uu',
    minute: 'mm',
  };
  const datePlaceholder = dateLocaleMeta.partsOrder
    .map(part => placeholderMap[part])
    .join(dateLocaleMeta.separator);
  const placeholder = `${datePlaceholder} ${placeholderMap.hour}:${placeholderMap.minute}`;

  // Value could be anything, but we only try to parse as an ISO-8601 string, because this is what
  // we set to the field on blur if the date was correctly parsed using the locale meta.
  const currentDateTime = parseDateTime(value);
  const dateTimePartsFromValue = dateObjectToParts(currentDateTime);
  const [{date, hour, minute}, setDateTimeParts] =
    useState<DateTimePartValues>(dateTimePartsFromValue);

  // Synchronize with external changes if we have a value and our date parts don't
  // reflect it
  useEffect(
    () => {
      const shouldIgnore =
        currentDateTime === null && (date === '' || hour === '' || minute === '');
      const newValueParts = dateObjectToParts(currentDateTime);

      // console.log(newValueParts);

      const dateInconsistent = parseInt(newValueParts.date) !== parseInt(date);
      const hourInconsistent = parseInt(newValueParts.hour) !== parseInt(hour);
      const minuteInconsistent = parseInt(newValueParts.minute) !== parseInt(minute);

      const isInconsistent = dateInconsistent || hourInconsistent || minuteInconsistent;
      if (isInconsistent && !shouldIgnore) {
        setDateTimeParts(newValueParts);
      }
    },
    // we deliberately exclude date, hour, and minute from the dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [currentDateTime, setValue]
  );

  const onPartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // we must cast here since we can't pass the valid input names as a generic.
    const name = event.target.name as DateTimePart;
    const value = event.target.value;

    // update the state of the individual parts
    const newDateParts = {date, hour, minute, [name]: value};
    setDateTimeParts(newDateParts);

    const hasAllParts =
      newDateParts.date !== '' && newDateParts.hour !== '' && newDateParts.minute !== '';

    if (!hasAllParts) {
      // as soon as one part is missing, treat as if the entire field was cleared
      setValue('');
    } else {
      // otherwise we have all parts to construct a date, BUT it may be nonsense. It's
      // up to validation libraries to check this.
      const [year, month, day] = newDateParts.date.split('-');
      setValue(
        partsToUnvalidatedISO8601({
          year,
          month,
          day,
          hour: newDateParts.hour,
          minute: newDateParts.minute,
        })
      );
    }
  };

  // Format the date according to the locale (remove comma) and use as the textbox value. Otherwise,
  // just use the field value directly.
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
            const newValue = date ? formatISO(date, {representation: 'complete'}) : value;
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
              // setDate(truncated);
              // TODO-83: this should only close when there are no time inputs (if we decide to
              //  combine DatePicker and DateTimePicker)
              // setIsOpen(false, {keepDismissed: true});
            });
            await setTouched(true);
          }}
          currentDate={currentDateTime ?? undefined}
          minDate={minDate}
          maxDate={maxDate}
          events={calendarEvents}
        />
        {/* TODO-83: you can still enter bogus in this field. Though entering letters will clear
           the value, but large numbers do work and will be transformed to an unvalidated ISO-8601 string */}
        <div>
          <input
            type="number"
            step="1"
            min="0"
            max="23"
            value={hour}
            maxLength={2}
            aria-label="hour"
            name="hour"
            onChange={onPartChange}
          />
          <p>:</p>
          <input
            type="number"
            step="1"
            min="0"
            max="59"
            value={minute}
            maxLength={2}
            aria-label="minute"
            name="minute"
            onChange={onPartChange}
          />
        </div>
      </FloatingWidget>
    </>
  );
};

export default DateTimePicker;
