import {FormField} from '@utrecht/component-library-react';
import {useFormikContext} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig} from '@/hooks';

import TimeInputGroup from './TimeInputGroup';

export interface TimeFieldProps {
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
}

const TimeField: React.FC<TimeFieldProps> = ({
  name,
  label,
  isRequired,
  isDisabled,
  description,
  tooltip,
  autoComplete,
}) => {
  const id = useId();
  const {getFieldMeta} = useFormikContext();
  const {error = '', touched} = getFieldMeta(name);
  name = useFieldConfig(name);

  const isInvalid = touched && !!error;
  const errorMessageId = isInvalid ? `${id}-error-message` : undefined;

  return (
    <FormField type="text" invalid={isInvalid} className="utrecht-form-field--openforms">
      <TimeInputGroup
        name={name}
        label={label}
        isRequired={isRequired}
        isDisabled={isDisabled}
        tooltip={tooltip}
        autoComplete={autoComplete}
      />
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

export default TimeField;
