import {FormField} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig, useFieldError} from '@/hooks';

import DateInputGroup from './DateInputGroup';
import DatePicker from './DatePicker';

export interface DatePickerProps {
  /**
   * Earliest date that is selectable in the calendar.
   */
  minDate?: Date;
  /**
   * Latest date that is selectable in the calendar.
   */
  maxDate?: Date;
  /**
   * An array of ISO-8601 (YYYY-MM-DD) date strings, representing not-available dates.
   */
  disabledDates?: string[];
}

/**
 * Which widget to render for the field. Either an input group (for known dates) or
 * a calendar to pick an available date.
 */
export type WidgetProps =
  | {
      widget: 'inputGroup';
    }
  | {
      widget: 'datePicker';
      widgetProps?: DatePickerProps;
    };

interface DateFieldCommonProps {
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
   * Readonly fields get marked as such in an accessible manner.
   */
  isReadOnly?: boolean;
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
   * How to autocomplete the field from the browser.
   */
  autoComplete?: string;
  /**
   * Marker to signal this field is used in a multi-value field parent, which requires
   * some special attention w/r to validation errors.
   */
  isMultiValue?: boolean;
}

export type DateFieldProps = DateFieldCommonProps & WidgetProps;

/**
 * Implements a form field to enter and/or select dates.
 *
 * The field has two variants:
 *  1. Input groups - consists of separate inputs for day, month, and year. Suitable for known
 *     dates such as birthdays.
 *  2. Datepicker - text input with a calendar where a date can be selected, that toggles when
 *     focussing the field. Suitable for nearby dates such as appointments.
 * The variant to use can be selected using the `widget` prop.
 */
const DateField: React.FC<DateFieldProps> = ({
  name,
  label,
  isRequired,
  isReadOnly,
  description,
  tooltip,
  autoComplete,
  isMultiValue = false,
  ...props
}) => {
  const id = useId();
  const {getFieldMeta} = useFormikContext();
  name = useFieldConfig(name);
  const {touched} = getFieldMeta(name);
  const error = useFieldError(name, isMultiValue);

  const isInvalid = touched && !!error;
  const errorMessageId = isInvalid ? `${id}-error-message` : undefined;

  let dateInput: React.ReactElement;
  switch (props.widget) {
    case 'inputGroup': {
      dateInput = (
        <DateInputGroup
          name={name}
          label={label}
          tooltip={tooltip}
          isRequired={isRequired}
          isReadOnly={isReadOnly}
          autoComplete={autoComplete}
          aria-describedby={errorMessageId}
        />
      );
      break;
    }
    case 'datePicker': {
      dateInput = (
        <DatePicker
          name={name}
          label={label}
          tooltip={tooltip}
          isRequired={isRequired}
          isReadOnly={isReadOnly}
          aria-describedby={errorMessageId}
          {...props.widgetProps}
        />
      );
    }
  }

  return (
    <FormField type="text" invalid={isInvalid} className="utrecht-form-field--openforms">
      {dateInput}
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

DateField.displayName = 'DateField';

export default DateField;
