import {
  FormField,
  FormFieldDescription,
  Checkbox as UtrechtCheckbox,
} from '@utrecht/component-library-react';
import {clsx} from 'clsx';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import {LabelContent} from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig} from '@/hooks';

import './Checkbox.scss';

export interface CheckboxProps {
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
   * Sometimes the label should never get an asterisk or suffix for the required state,
   * e.g. when the checkbox is part of a larger component (like selectboxes).
   */
  ignoreRequired?: boolean;
  /**
   * Disabled fields get marked as such in an accessible manner.
   */
  isDisabled?: boolean;
  /**
   * Whether the checkbox should be disabled or not.
   */
  disabled?: boolean;
  /**
   * Additional description displayed close to the field - use this to document any
   * validation requirements that are crucial to successfully submit the form. More
   * information that is contextual/background typically belongs in a tooltip.
   */
  description?: React.ReactNode;
  /**
   * Whether to treat the description as help text for a standalone field or blend the
   * description in more with the label.
   */
  descriptionAsHelpText?: boolean;
  /**
   * Optional tooltip to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  tooltip?: React.ReactNode;
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label = '',
  isRequired = false,
  description = '',
  descriptionAsHelpText = true,
  isDisabled = false,
  ignoreRequired = false,
  tooltip,
}) => {
  const {validateField} = useFormikContext();
  name = useFieldConfig(name);

  // the value should not be passed down to underlying checkbox
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [{value, ...props}, {error = '', touched}] = useField<boolean | undefined>({
    name,
    type: 'checkbox',
  });
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const descriptionId = description && !descriptionAsHelpText ? `${id}-description` : undefined;

  const ariaDescribedBy = [errorMessageId, descriptionId].filter(Boolean).join(' ');
  return (
    <FormField type="checkbox" invalid={invalid} className="utrecht-form-field--openforms">
      <UtrechtCheckbox
        id={id}
        className="utrecht-form-field__input utrecht-custom-checkbox utrecht-custom-checkbox--html-input utrecht-custom-checkbox--openforms"
        appearance="custom"
        invalid={invalid}
        aria-describedby={ariaDescribedBy || undefined}
        disabled={isDisabled}
        {...props}
        onBlur={async e => {
          props.onBlur(e);
          await validateField(name);
        }}
      />
      <div
        className={clsx('utrecht-form-field__label', 'utrecht-form-field__label--checkbox', {
          'utrecht-form-field__label--openforms-tooltip': !!tooltip,
        })}
      >
        <LabelContent
          type="checkbox"
          id={id}
          isDisabled={isDisabled}
          isRequired={isRequired}
          noOptionalSuffix={ignoreRequired}
        >
          {label}
        </LabelContent>
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>

      {descriptionAsHelpText ? (
        <HelpText>{description}</HelpText>
      ) : (
        description && (
          <FormFieldDescription id={descriptionId} className="utrecht-form-field__description">
            {description}
          </FormFieldDescription>
        )
      )}

      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
