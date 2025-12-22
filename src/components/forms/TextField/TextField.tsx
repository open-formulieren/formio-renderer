import {FormField, Paragraph, Textbox} from '@utrecht/component-library-react';
import type {TextboxProps} from '@utrecht/component-library-react/dist/Textbox';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';

import CharCount from '@/components/forms/CharCount';
import HelpText from '@/components/forms/HelpText';
import Label from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig, useFieldError} from '@/hooks';

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
  /**
   * Displays a countdown of the remaining amount of characters if a max length is
   * provided, otherwise show how many characters are used.
   */
  showCharCount?: boolean;
  /**
   * Needed for `showCharCount` to calculate the remaining amount of characters.
   */
  maxLength?: number;
  /**
   * Marker to signal this field is used in a multi-value field parent, which requires
   * some special attention w/r to validation errors.
   */
  isMultiValue?: boolean;
  /**
   * Any additional content, positioned between the text field and the description (if any).
   */
  children?: React.ReactNode;
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
  maxLength,
  showCharCount = false,
  isMultiValue = false,
  children,
  ...extraProps
}) => {
  name = useFieldConfig(name);
  const {validateField} = useFormikContext();
  const [{value, ...props}, {touched}] = useField<string | undefined>({
    name,
    type: 'text',
  });
  const error = useFieldError(name, isMultiValue);
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const characterCountId = `${id}-character-count`;

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
        <Textbox
          // ensure unsetting values doesn't ping-pong us between controlled/uncontrolled
          // components
          value={value ?? ''}
          {...props}
          onBlur={async e => {
            props.onBlur(e);
            await validateField(name);
          }}
          className="utrecht-textbox--openforms"
          id={id}
          disabled={isDisabled}
          invalid={invalid}
          aria-describedby={
            [errorMessageId, showCharCount && characterCountId].filter(Boolean).join(' ') ||
            undefined
          }
          placeholder={placeholder}
          {...extraProps}
        />
      </Paragraph>
      {showCharCount && (value?.length ?? 0) > 0 && (
        <CharCount id={characterCountId} text={value} limit={maxLength} />
      )}
      {children}
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

TextField.displayName = 'TextField';

export default TextField;
