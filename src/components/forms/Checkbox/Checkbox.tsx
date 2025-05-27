import {FormField, Checkbox as UtrechtCheckbox} from '@utrecht/component-library-react';
import clsx from 'clsx';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import {LabelContent} from '@/components/forms/Label';
import Tooltip from '@/components/forms/Tooltip';
import ValidationErrors from '@/components/forms/ValidationErrors';

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
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label = '',
  isRequired = false,
  description = '',
  isDisabled = false,
  tooltip,
}) => {
  const {validateField} = useFormikContext();
  const [{value, ...props}, {error = '', touched}] = useField<boolean | undefined>({
    name,
    type: 'checkbox',
  });
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  return (
    <FormField type="checkbox" invalid={invalid} className="utrecht-form-field--openforms">
      <UtrechtCheckbox
        id={id}
        className="utrecht-form-field__input utrecht-custom-checkbox utrecht-custom-checkbox--html-input utrecht-custom-checkbox--openforms"
        appearance="custom"
        invalid={invalid}
        aria-describedby={errorMessageId}
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
        <LabelContent type="checkbox" id={id} isDisabled={isDisabled} isRequired={isRequired}>
          {label}
        </LabelContent>
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>
      <HelpText>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </FormField>
  );
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
