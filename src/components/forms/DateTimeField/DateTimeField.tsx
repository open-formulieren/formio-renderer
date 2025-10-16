import {FormField} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig} from '@/hooks';

import DateTimePicker from './DateTimePicker';

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
  // TODO-83: is this prop relevant here?
  /**
   * An array of ISO-8601 (YYYY-MM-DD) date strings, representing not-available dates.
   */
  disabledDates?: string[];
}

/**
 * Implements a form field to enter/select a date and time.
 *
 * Consists of a text input with a floating widget that toggles when focussing the field. This
 * floating widget contains a calendar where a date can be selected, and a time input where a
 * time can be selected. Suitable for nearby dates such as appointments.
 */
// TODO-83: perhaps just put the DateTimePicker code here?
const DateTimeField: React.FC<DateTimeFieldProps> = ({
  name,
  label,
  isRequired,
  isDisabled,
  description,
  tooltip,
  minDate,
  maxDate,
  disabledDates,
}) => {
  const id = useId();
  const {getFieldMeta} = useFormikContext();
  name = useFieldConfig(name);
  const {error = '', touched} = getFieldMeta(name);

  const isInvalid = touched && !!error;
  const errorMessageId = isInvalid ? `${id}-error-message` : undefined;

  return (
    <FormField type="text" invalid={isInvalid} className="utrecht-form-field--openforms">
      <DateTimePicker
        name={name}
        label={label}
        tooltip={tooltip}
        isRequired={isRequired}
        isDisabled={isDisabled}
        aria-describedby={errorMessageId}
        minDate={minDate}
        maxDate={maxDate}
        disabledDates={disabledDates}
      />
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

DateTimeField.displayName = 'DateTimeField';

export default DateTimeField;
