import {useField, useFormikContext} from 'formik';
import {useEffect, useState} from 'react';

import {InputGroup} from '@/components/forms/InputGroup';

import type {TimePart, TimePartValues} from '../types';
import {parseTime, partsToUnvalidatedISO8601} from '../utils';
import TimeInputItems from './TimeInputItems';

const timeStringToParts = (value: string): TimePartValues => {
  const timeValue = parseTime(value);
  const [fallbackHour = '', fallbackMinute = '', fallbackSecond = ''] = value.split(':');
  return {
    hour: timeValue ? timeValue.hour : fallbackHour,
    minute: timeValue ? timeValue.minute : fallbackMinute,
    second: timeValue ? timeValue.second : fallbackSecond,
  };
};

export interface TimeInputGroupProps {
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
const TimeInputGroup: React.FC<TimeInputGroupProps> = ({
  name,
  label,
  tooltip,
  isRequired,
  isDisabled,
  autoComplete,
  'aria-describedby': ariaDescribedBy,
}) => {
  const {validateField} = useFormikContext();
  // value is an ISO-8601 string _if_ a valid time was provided at some point.
  const [{value}, {error, touched}, {setTouched, setValue}] = useField<string>(name);

  const timePartsFromValue = timeStringToParts(value);
  const [{hour, minute, second}, setTimeParts] = useState<TimePartValues>(timePartsFromValue);

  // synchronize with external changes if we have a value and our date parts don't
  // reflect it
  useEffect(
    () => {
      // if an empty part leads to an invalid time, the value in Formik state is reset,
      // but this may not clear the other parts if the user is still making changes.
      const shouldIgnore = value === '' && (hour === '' || minute === '');
      const newValueParts = timeStringToParts(value);

      const hourInconsistent = parseInt(newValueParts.hour) !== parseInt(hour);
      const minuteInconsistent = parseInt(newValueParts.minute) !== parseInt(minute);

      const isInconsistent = hourInconsistent || minuteInconsistent;
      if (isInconsistent && !shouldIgnore) {
        setTimeParts(newValueParts);
      }
    },
    // we deliberately exclude hour, minute from the dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [value]
  );

  const onPartChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // we must cast here since we can't pass the valid input names as a generic.
    const name = event.target.name as TimePart;
    const value = event.target.value;

    // update the state of the individual parts
    const newTimeParts = {hour, minute, second, [name]: value};
    setTimeParts(newTimeParts);

    const hasAllParts = newTimeParts.hour !== '' && newTimeParts.minute !== '';

    if (!hasAllParts) {
      // as soon as hour or minute is missing, treat as if the entire field was cleared
      setValue('');
    } else {
      // otherwise we have all parts to construct a date, BUT it may be nonsense. It's
      // up to validation libraries to check this.
      setValue(partsToUnvalidatedISO8601(newTimeParts));
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
    >
      <TimeInputItems
        hour={hour}
        minute={minute}
        isDisabled={isDisabled}
        onChange={onPartChange}
        onBlur={async () => {
          setTouched(true);
          if (hour && minute) {
            await validateField(name);
          }
        }}
        autoComplete={autoComplete}
      />
    </InputGroup>
  );
};

export default TimeInputGroup;
