import {useField} from 'formik';
import {useEffect, useState} from 'react';

import {InputGroup} from '@/components/forms/InputGroup';

import DateInputItems from './DateInputItems';
import type {DatePart, DatePartValues} from './types';
import {parseDate, partsToISO8601} from './utils';

const dateStringToParts = (value: string): DatePartValues => {
  const dateValue = parseDate(value);
  const datePartsFromValue: DatePartValues = dateValue
    ? {
        year: String(dateValue.getFullYear()),
        // In JS dates, month 0 is January, but in user inputs this shows as '1'
        month: String(dateValue.getMonth() + 1),
        day: String(dateValue.getDate()),
      }
    : {year: '', month: '', day: ''};
  return datePartsFromValue;
};

export interface DateInputGroupProps {
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
   * Any valid autocomplete attribute.
   */
  autoComplete?: string;
  'aria-describedby'?: string;
}

/**
 * An input group for date values.
 *
 * The input group consists of three inputs, one for year, month and day each. The
 * inputs are ordered according to the user's locale.
 *
 * Individual inputs are tracked and when all three are provided, we attempt to parse
 * it into a valid date. If it's a valid date, the real field state is updated with the
 * new value, otherwise the field value is cleared. This means that the Formik state is
 * either an empty string, or a valid ISO-8601 date string.
 */
const DateInputGroup: React.FC<DateInputGroupProps> = ({
  name,
  label,
  isRequired,
  isDisabled,
  autoComplete,
  'aria-describedby': ariaDescribedBy,
}) => {
  // value is an ISO-8601 string _if_ a valid date was provided at some point.
  const [{value}, {error}, {setTouched, setValue}] = useField<string>(name);

  const datePartsFromValue = dateStringToParts(value);
  const [{year, month, day}, setDateParts] = useState<DatePartValues>(datePartsFromValue);

  // synchronize with external changes if we have a value and our date parts don't
  // reflect it
  useEffect(
    () => {
      // if an empty part leads to an invalid date, the value in Formik state is reset,
      // but this may not clear the other parts if the user is still making changes.
      const shouldIgnore = value === '' && (year === '' || month === '' || day === '');
      const newValueParts = dateStringToParts(value);
      const isInconsistent =
        newValueParts.year !== year || newValueParts.month !== month || newValueParts.day !== day;
      if (isInconsistent && !shouldIgnore) {
        setDateParts(newValueParts);
      }
    },
    // we deliberately exclude year, month, day from the dependencies
    [value]
  );

  const onPartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // we must cast here since we can't pass the valid input names as a generic.
    const name = event.target.name as DatePart;
    const value = event.target.value;

    // update the state of the individual parts
    const newDateParts = {year, month, day, [name]: value};
    setDateParts(newDateParts);

    const hasAllParts =
      newDateParts.year !== '' && newDateParts.month !== '' && newDateParts.day !== '';

    // update the formik state accordingly - we only allow valid dates or empty values
    const formikValue = hasAllParts ? partsToISO8601(newDateParts) : '';
    setValue(formikValue ?? '');
  };

  return (
    <InputGroup
      label={label}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={!!error}
      aria-describedby={ariaDescribedBy}
    >
      <DateInputItems
        year={year}
        month={month}
        day={day}
        isDisabled={isDisabled}
        onChange={onPartChange}
        onBlur={() => setTouched(true)}
        autoComplete={autoComplete}
      />
    </InputGroup>
  );
};

export default DateInputGroup;
