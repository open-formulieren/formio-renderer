import {useField} from 'formik';
import {useState} from 'react';

import {InputGroup} from '@/components/forms/InputGroup';

import DateInputItems from './DateInputItems';
import type {DatePart, DatePartValues} from './types';
import {parseDate, partsToISO8601} from './utils';

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
}) => {
  // value is an ISO-8601 string _if_ a valid date was provided at some point.
  const [{value}, {error}, {setTouched, setValue}] = useField<string>(name);

  const dateValue = parseDate(value);

  const [{year, month, day}, setDateParts] = useState<DatePartValues>({
    year: dateValue ? String(dateValue.getFullYear()) : '',
    // In JS dates, month 0 is January, but in user inputs this shows as '1'
    month: dateValue ? String(dateValue.getMonth() + 1) : '',
    day: dateValue ? String(dateValue.getDate()) : '',
  });

  const onPartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // we must cast here since we can't pass the valid input names as a generic.
    const name = event.target.name as DatePart;
    const value = event.target.value;

    // update the state of the individual parts
    const newDateParts = {year, month, day, [name]: value};
    setDateParts(newDateParts);

    // update the formik state accordingly - we only allow valid dates or empty values
    const formikValue = partsToISO8601(newDateParts);
    setValue(formikValue ?? '');
  };

  return (
    <InputGroup label={label} isRequired={isRequired} isDisabled={isDisabled} isInvalid={!!error}>
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
