import {FormField, Paragraph, Textarea as UtrechtTextarea} from '@utrecht/component-library-react';
import type {TextareaProps as UtrechtTextareaProps} from '@utrecht/component-library-react/dist/Textarea';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';

import './Textarea.scss';

export interface TextareaProps {
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

const Textarea: React.FC<TextareaProps & UtrechtTextareaProps> = ({
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
  const [{value, ...props}, {error = '', touched}] = useField<string | undefined>({
    name,
    type: 'text',
  });
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  return (
    <FormField type="text" invalid={invalid} className="utrecht-form-field--openforms">
      <Label
        id={id}
        isRequired={isRequired}
        isDisabled={isDisabled}
        tooltip={tooltip ? <Tooltip>{tooltip}</Tooltip> : undefined}
      >
        {label}
      </Label>
      <Paragraph>
        <UtrechtTextarea
          // ensure unsetting values doesn't ping-pong us between controlled/uncontrolled
          // components
          value={value ?? ''}
          {...props}
          onBlur={async e => {
            props.onBlur(e);
            await validateField(name);
          }}
          className="utrecht-textarea--openforms"
          id={id}
          disabled={isDisabled}
          invalid={invalid}
          aria-describedby={errorMessageId}
          placeholder={placeholder}
          {...extraProps}
        />
      </Paragraph>
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

Textarea.displayName = 'Textarea';

export default Textarea;
