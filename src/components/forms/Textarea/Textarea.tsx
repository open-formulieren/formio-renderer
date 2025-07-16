import {FormField, Paragraph, Textarea as UtrechtTextarea} from '@utrecht/component-library-react';
import type {TextareaProps as UtrechtTextareaProps} from '@utrecht/component-library-react/dist/Textarea';
import clsx from 'clsx';
import {useField, useFormikContext} from 'formik';
import {useId, useLayoutEffect, useRef} from 'react';

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
  /**
   * Automatic expanding and shrinking of fields to fit their content.
   */
  autoExpand?: boolean;
}

const Textarea: React.FC<TextareaProps & UtrechtTextareaProps> = ({
  name,
  label = '',
  isRequired = false,
  description = '',
  isDisabled = false,
  autoExpand = false,
  placeholder,
  tooltip,
  ...extraProps
}) => {
  const {validateField} = useFormikContext();
  const [{value, ...props}, {error = '', touched}] = useField<string | undefined>(name);
  const id = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoExpand) {
      return;
    }

    const {borderBlockStart, borderBlockEnd} = getComputedStyle(textarea);
    // Reset textarea, so we can accurately calculate the scrollHeight
    textarea.style.blockSize = 'auto';

    // `scrollHeight` does account for the padding, but not the border, so we have to add
    // that manually
    const newHeight =
      textarea.scrollHeight + parseFloat(borderBlockStart) + parseFloat(borderBlockEnd);
    textarea.style.blockSize = `${newHeight}px`;
  }, [autoExpand, value, textareaRef]);

  return (
    <FormField type="textarea" invalid={invalid} className="utrecht-form-field--openforms">
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
          ref={textareaRef}
          // ensure unsetting values doesn't ping-pong us between controlled/uncontrolled
          // components
          value={value ?? ''}
          {...props}
          onBlur={async e => {
            props.onBlur(e);
            await validateField(name);
          }}
          className={clsx('utrecht-textarea--openforms', {
            'utrecht-textarea--openforms-no-resize': autoExpand,
          })}
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
