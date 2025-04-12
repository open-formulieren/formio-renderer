import {FormField, Paragraph, Textbox} from '@utrecht/component-library-react';
import type {TextboxProps} from '@utrecht/component-library-react/dist/Textbox';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';

import './TextField.scss';

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
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
  /**
   * Placeholder when no (default) value is available.
   */
  placeholder?: string;
}

/**
 * A plain textfield form field, complete with label, help text and validation errors.
 *
 * The form field state is managed with Formik, but this should only be an
 * implementation detail within this library.
 */
const TextField: React.FC<TextFieldProps & TextboxProps> = ({
  name,
  label = '',
  isRequired = false,
  description = '',
  isDisabled = false,
  placeholder,
  tooltip,
  ...extraProps
}) => {
  const {validateField} = useFormikContext();
  const [props, {error = '', touched}] = useField({name, type: 'text'});
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const tooltipId = tooltip ? `${id}-tooltip` : undefined;

  return (
    <FormField type="text" invalid={invalid} className="utrecht-form-field--openforms">
      <Label
        id={id}
        isRequired={isRequired}
        isDisabled={isDisabled}
        tooltip={tooltip ? <Tooltip id={tooltipId}>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>
      <Paragraph>
        <Textbox
          {...props}
          onBlur={async e => {
            props.onBlur(e);
            await validateField(name);
          }}
          className="utrecht-textbox--openforms"
          id={id}
          disabled={isDisabled}
          invalid={invalid}
          aria-describedby={[tooltipId, errorMessageId].filter(Boolean).join(' ')}
          placeholder={placeholder}
          {...extraProps}
        />
      </Paragraph>
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

TextField.displayName = 'TextField';

export default TextField;
