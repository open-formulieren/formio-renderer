import {FormField} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import ValidationErrors from '@/components/forms/ValidationErrors';

import DateInputGroup from './DateInputGroup';

/**
 * Which widget to render for the field. Either an input group (for known dates) or
 * a calendar to pick an available date.
 */
export type DateFieldWidget = 'inputGroup' | 'datePicker';

export interface DateFieldProps {
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
   * How to autocomplete the field from the browser.
   */
  autoComplete?: string;
  /**
   * The kind of date input widget.
   */
  widget: DateFieldWidget;
}

/**
 * Implements a form field to select dates.
 *
 * For accessibility reasons, there should always be a text field allowing users to
 * manually type in the date. However, when the field is focused, this toggles the
 * calendar where a date can be selected using a pointer device.
 *
 * @todo on mobile devices, use the native date picker?
 */
const DateField: React.FC<DateFieldProps> = ({
  name,
  label,
  isRequired,
  isDisabled,
  description,
  tooltip,
  autoComplete,
  widget,
}) => {
  const id = useId();
  const {getFieldMeta} = useFormikContext();
  const {error = '', touched} = getFieldMeta(name);

  const isInvalid = touched && !!error;
  const errorMessageId = isInvalid ? `${id}-error-message` : undefined;

  let dateInput: React.ReactElement;
  switch (widget) {
    case 'inputGroup': {
      dateInput = (
        <DateInputGroup
          name={name}
          label={label}
          tooltip={tooltip}
          isRequired={isRequired}
          isDisabled={isDisabled}
          autoComplete={autoComplete}
          aria-describedby={errorMessageId}
        />
      );
      break;
    }
    case 'datePicker': {
      dateInput = <>Not implemented</>;
      break;
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
