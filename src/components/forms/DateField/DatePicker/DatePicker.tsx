import {Paragraph, Textbox} from '@utrecht/component-library-react';
import {formatISO} from 'date-fns';
import {useField, useFormikContext} from 'formik';
import {useId, useState} from 'react';
import {flushSync} from 'react-dom';
import {useIntl} from 'react-intl';

import DatePickerCalendar from '@/components/forms/DatePickerCalendar';
import {FloatingWidget, useFloatingWidget} from '@/components/forms/FloatingWidget';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import Icon from '@/components/icons';

import {useDateLocaleMeta} from '../hooks';
import {PART_PLACEHOLDERS} from '../messages';
import {parseDate} from '../utils';
import './DatePicker.scss';

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

/**
 * Implements a form field to select dates.
 *
 * For accessibility reasons, there should always be a text field allowing users to
 * manually type in the date. However, when the field is focused, this toggles the
 * calendar where a date can be selected using a pointer device.
 *
 * TODO: on mobile devices, use the native date picker?
 */
const DatePicker: React.FC<DatePickerProps> = ({
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
  const [{value, onBlur}, {error, touched}, {setTouched, setValue}] = useField<string>(name);
  const [rawValue, setRawValue] = useState(value ?? '');

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

  const placeholderMap = {
    day: formatMessage(PART_PLACEHOLDERS.day),
    month: formatMessage(PART_PLACEHOLDERS.month),
    year: formatMessage(PART_PLACEHOLDERS.year),
  };
  const placeholder = dateLocaleMeta.partsOrder
    .map(part => placeholderMap[part])
    .join(dateLocaleMeta.separator);

  // format a date according to the current locale
  const _formatDate = (dateValue: string | Date): string => {
    return formatDate(dateValue, {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };
  // Value could be anything, but we only try to parse as an ISO-8601 string, because this is what
  // we set to the field on blur if the date was correctly parsed using the locale meta.
  const currentDate = parseDate(value);

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
          value={rawValue && parseDate(rawValue) ? _formatDate(rawValue) : rawValue}
          onChange={event => {
            // Set the raw value in the textbox and update the formik value depending on
            // if we have a valid date or not
            const newRaw = event.target.value;
            setRawValue(newRaw);
            const parsed = parseDate(newRaw, dateLocaleMeta);
            setValue(parsed ? formatISO(parsed, {representation: 'date'}) : newRaw);
          }}
          onBlur={async event => {
            // Attempt to create a date object using the locale meta
            const parsed = parseDate(rawValue, dateLocaleMeta);
            if (parsed) {
              // We have a date object, format it according to the locale and use it as
              // the textbox value.
              setRawValue(_formatDate(parsed));
              // Format the parsed date to an ISO-8601 string and set it as the field value.
              setValue(formatISO(parsed, {representation: 'date'}));
            }
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
      >
        <DatePickerCalendar
          onCalendarClick={async selectedDate => {
            flushSync(() => {
              // Need to truncate, because the selected date is in datetime format
              const truncated = selectedDate.substring(0, 10);
              setValue(truncated);
              // Set the raw value in the textbox after we apply the format based on locale
              setRawValue(_formatDate(truncated));
              setIsOpen(false, {keepDismissed: true});
            });
            await setTouched(true);
          }}
          currentDate={currentDate ?? undefined}
          minDate={minDate}
          maxDate={maxDate}
          events={calendarEvents}
        />
      </FloatingWidget>
    </>
  );
};

export default DatePicker;
