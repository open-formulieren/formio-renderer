import {useField, useFormikContext} from 'formik';
import {useEffect, useState} from 'react';

import {InputGroup} from '@/components/forms/InputGroup';

import type {DatePart, DatePartValues} from '../types';
import {parseDate, partsToUnvalidatedISO8601} from '../utils';
import DateInputItems from './DateInputItems';

const dateStringToParts = (value: string): DatePartValues => {
  const dateValue = parseDate(value);
  const [fallbackYear = '', fallbackMonth = '', fallbackDay = ''] = value.split('-');
  const datePartsFromValue: DatePartValues = dateValue
    ? {
        year: String(dateValue.getFullYear()),
        // In JS dates, month 0 is January, but in user inputs this shows as '1'
        month: String(dateValue.getMonth() + 1),
        day: String(dateValue.getDate()),
      }
    : {year: fallbackYear, month: fallbackMonth, day: fallbackDay};
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
  tooltip,
  isRequired,
  isDisabled,
  autoComplete,
  'aria-describedby': ariaDescribedBy,
}) => {
  const {validateField} = useFormikContext();
  // value is an ISO-8601 string _if_ a valid date was provided at some point.
  const [{value}, {error, touched}, {setTouched, setValue}] = useField<string>(name);

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

      const yearInconsistent = parseInt(newValueParts.year) !== parseInt(year);
      const monthInconsistent = parseInt(newValueParts.month) !== parseInt(month);
      const dayInconsistent = parseInt(newValueParts.day) !== parseInt(day);

      const isInconsistent = yearInconsistent || monthInconsistent || dayInconsistent;
      if (isInconsistent && !shouldIgnore) {
        setDateParts(newValueParts);
      }
    },
    // we deliberately exclude year, month, day from the dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (!hasAllParts) {
      // as soon as one part is missing, treat as if the entire field was cleared
      setValue('');
    } else {
      // otherwise we have all parts to construct a date, BUT it may be nonsense. It's
      // up to validation libraries to check this.
      setValue(partsToUnvalidatedISO8601(newDateParts));
    }
  };

  return (
    <InputGroup
      label={label}
      tooltip={tooltip}
      isRequired={isRequired}
      isDisabled={isDisabled}
      isInvalid={touched && !!error}
      aria-describedby={ariaDescribedBy}
      name={name}
    >
      <DateInputItems
        year={year}
        month={month}
        day={day}
        isDisabled={isDisabled}
        onChange={onPartChange}
        onBlur={async () => {
          setTouched(true);
          if (year && month && day) {
            await validateField(name);
          }
        }}
        autoComplete={autoComplete}
      />
    </InputGroup>
  );
};

export default DateInputGroup;
