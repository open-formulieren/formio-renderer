import {Paragraph, Textbox} from '@utrecht/component-library-react';
import {formatISO} from 'date-fns';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';
import {flushSync} from 'react-dom';
import {useIntl} from 'react-intl';

import {FloatingWidget, useFloatingWidget} from '@/components/forms/FloatingWidget';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import Icon from '@/components/icons';

import {useDateLocaleMeta} from '../hooks';
import {PART_PLACEHOLDERS} from '../messages';
import {parseDate} from '../utils';
import './DatePicker.scss';
import DatePickerCalendar from './DatePickerCalendar';

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
 * The entered value is tracked and we attempt to parse it into a valid date. If it's a
 * valid date, the real field state is updated with the new value, otherwise the field
 * value is cleared. This means that the Formik state is either an empty string, or a
 * valid ISO-8601 date string.
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

  const placeholderMap = {
    day: formatMessage(PART_PLACEHOLDERS.day),
    month: formatMessage(PART_PLACEHOLDERS.month),
    year: formatMessage(PART_PLACEHOLDERS.year),
  };
  const placeholder = dateLocaleMeta.partsOrder
    .map(part => placeholderMap[part])
    .join(dateLocaleMeta.separator);

  // Value could be anything, but we only try to parse as an ISO-8601 string, because this is what
  // we set to the field on blur if the date was correctly parsed using the locale meta. If it was
  // successfully parsed into a date object, format it according to the locale and use as the
  // textbox value. Otherwise, just use the field value directly.
  const currentDate = parseDate(value);
  const textboxValue =
    currentDate !== null
      ? formatDate(currentDate, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
        })
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
            const date = parseDate(value, dateLocaleMeta);
            // If we were able to create a date object, format it to an ISO-8601 string and set it
            // as the field value. Otherwise, just set the entered value to the field directly.
            // It's up to the validation libraries to check it.
            const newValue = date ? formatISO(date, {representation: 'date'}) : value;
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
              setValue(truncated);
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
