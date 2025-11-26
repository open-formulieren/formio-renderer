import {FormField, Paragraph, Textbox} from '@utrecht/component-library-react';
import {formatISO} from 'date-fns';
import {useField, useFormikContext} from 'formik';
import {useEffect, useId, useState} from 'react';
import {flushSync} from 'react-dom';
import {useIntl} from 'react-intl';

import DatePickerCalendar from '@/components/forms/DatePickerCalendar';
import {FloatingWidget, useFloatingWidget} from '@/components/forms/FloatingWidget';
import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import Icon from '@/components/icons';
import {useFieldConfig, useFieldError} from '@/hooks';

import './DateTimeField.scss';
import {useDateLocaleMeta} from './hooks';
import {PART_PLACEHOLDERS} from './messages';
import {parseDateTime} from './utils';

export interface DateTimeFieldProps {
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
   * Required fields get additional markup/styling to indicate this validation requirement.
   */
  isRequired?: boolean;
  /**
   * Disabled fields get marked as such in an accessible manner.
   */
  isDisabled?: boolean;
  /**
   * Additional description displayed close to the field - use this to document any
   * validation requirements that are crucial to successfully submit the form. More
   * information that is contextual/background typically belongs in a tooltip.
   */
  description?: React.ReactNode;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  /**
   * Earliest date that is selectable in the calendar.
   */
  minDate?: Date;
  /**
   * Latest date that is selectable in the calendar.
   */
  maxDate?: Date;
  'aria-describedby'?: string;
  /**
   * Marker to signal this field is used in a multi-value field parent, which requires
   * some special attention w/r to validation errors.
   */
  isMultiValue?: boolean;
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
 * Implements a form field to enter/select a date and time.
 *
 * Consists of a text input with a floating widget that toggles when focussing the field. This
 * floating widget contains a calendar where a date can be selected, and a time input where a
 * time can be selected. Suitable for nearby dates such as appointments.
 */
const DateTimeField: React.FC<DateTimeFieldProps> = ({
  name,
  label,
  isRequired,
  isDisabled,
  description,
  tooltip,
  minDate,
  maxDate,
  'aria-describedby': ariaDescribedBy,
  isMultiValue = false,
}) => {
  name = useFieldConfig(name);
  const id = useId();
  const {formatDate, formatMessage} = useIntl();
  const {validateField} = useFormikContext();
  const [{value, onBlur, onChange}, {touched}, {setTouched, setValue}] = useField<string>(name);
  const error = useFieldError(name, isMultiValue);
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

  const isInvalid = touched && !!error;
  const errorMessageId = isInvalid ? `${id}-error-message` : undefined;

  // Create placeholder
  const placeholderMap = {
    day: formatMessage(PART_PLACEHOLDERS.day),
    month: formatMessage(PART_PLACEHOLDERS.month),
    year: formatMessage(PART_PLACEHOLDERS.year),
  };
  const datePlaceholder = dateLocaleMeta.datePartsOrder
    .map(part => placeholderMap[part])
    .join(dateLocaleMeta.dateSeparator);
  let placeholder = `${datePlaceholder} ${formatMessage(PART_PLACEHOLDERS.hour)}${dateLocaleMeta.timeSeparator}${formatMessage(PART_PLACEHOLDERS.minute)}`;
  if (!dateLocaleMeta.is24HourFormat) {
    placeholder += ' [AM/PM]';
  }

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
      // If we have both parts, we can combine them into an ISO-8601 string, and convert to a date
      // object. This is possible, because the date picker and time input return a date and time
      // ISO-8601 string, respectively.
      const date_ = parseDateTime(`${newDateParts.date}T${newDateParts.time}:00`)!;
      setValue(formatISO(date_!));
    }
  };

  // If we have a date object, format it according to the locale (and remove comma) and use as the
  // textbox value. Otherwise, just use the field value directly.
  const textboxValue =
    currentDateTime !== null
      ? formatDate(currentDateTime, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }).replace(',', '')
      : value;

  const referenceProps = getReferenceProps();
  return (
    <FormField invalid={isInvalid} className="utrecht-form-field--openforms">
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
            // only run validation while the picker is not opened
            if (!isOpen) {
              await validateField(name);
            }
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
        returnFocus={false}
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
        />
        <Textbox
          type="time"
          step="60" // Ensures no seconds are displayed
          aria-label={formatMessage({
            description: 'Datetime picker: accessible time input field label',
            defaultMessage: 'Time',
          })}
          name="time"
          onChange={onPartChange}
          value={time}
          className="utrecht-textbox--openforms"
        />
      </FloatingWidget>
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

DateTimeField.displayName = 'DateTimeField';

export default DateTimeField;
