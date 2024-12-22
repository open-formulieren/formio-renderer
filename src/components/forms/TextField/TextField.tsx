import {Paragraph, Textbox, FormField as UtrechtFormField} from '@utrecht/component-library-react';
import {useField} from 'formik';
import {useId} from 'react';

import {HelpText, Label, ValidationErrors} from '@/components/forms';

export interface TextFieldProps {
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
}

/**
 * A plain textfield form field, complete with label, help text and validation errors.
 *
 * The form field state is managed with Formik, but this should only be an
 * implementation detail within this library.
 */
const TextField: React.FC<TextFieldProps> = ({
  name,
  label = '',
  isRequired = false,
  description = '',
  isDisabled = false,
  ...inputProps
}) => {
  const [props, {error = '', touched}] = useField({name, type: 'text'});
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  return (
    <UtrechtFormField type="text" invalid={invalid} className="utrecht-form-field--openforms">
      <Label id={id} isRequired={isRequired} isDisabled={isDisabled}>
        {label}
      </Label>
      <Paragraph>
        <Textbox
          {...props}
          className="utrecht-textbox--openforms"
          id={id}
          disabled={isDisabled}
          invalid={invalid}
          aria-describedby={errorMessageId}
          {...inputProps}
        />
      </Paragraph>
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </UtrechtFormField>
  );
};

export default TextField;
