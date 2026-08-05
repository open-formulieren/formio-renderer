import type {FAQItem} from '@open-formulieren/types';
import {Checkbox as UtrechtCheckbox} from '@utrecht/checkbox-react';
import {FormField} from '@utrecht/form-field-react';
import {clsx} from 'clsx';
import {useField, useFormikContext} from 'formik';
import {useId} from 'react';

import FAQItems from '@/components/forms/FAQItems';
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
   * Optional FAQ tooltips to provide additional information that is not crucial but may
   * assist users in filling out the field correctly.
   */
  faqItems?: FAQItem[];
}

const Checkbox: React.FC<CheckboxProps> = ({
  name,
  label = '',
  isRequired = false,
  description = '',
  isReadOnly = false,
  ignoreRequired = false,
  tooltip,
  faqItems = [],
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
  // TODO: enable this when we add the description to the aria-describedby for *all*
  // components
  // const descriptionId = description ? `${id}-description` : undefined;
  const descriptionId = undefined;

  const ariaDescribedBy = [errorMessageId, descriptionId].filter(Boolean).join(' ');

  return (
    <FormField type="checkbox" invalid={invalid} className="utrecht-form-field--openforms">
      {touched && errorMessageId && (
        <div className="utrecht-form-field__error-message">
          <ValidationErrors error={error} id={errorMessageId} />
        </div>
      )}

      {/* Input *beside* the label so that the grid styles position it correctly and
      prevent long labels from wrapping under the checkbox itself */}
      <UtrechtCheckbox
        id={id}
        className="utrecht-form-field__input utrecht-custom-checkbox utrecht-custom-checkbox--html-input utrecht-custom-checkbox--openforms"
        appearance="custom"
        invalid={invalid}
        aria-describedby={ariaDescribedBy || undefined}
        aria-readonly={isReadOnly}
        {...props}
        onChange={e => {
          // block form value changes if readonly - checkbox inputs don't support `readonly`
          // out of the box
          if (isReadOnly) return;
          props.onChange(e);
        }}
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
          isDisabled={isReadOnly}
          isRequired={isRequired}
          noOptionalSuffix={ignoreRequired}
        >
          {label}
        </LabelContent>
        {tooltip && <Tooltip>{tooltip}</Tooltip>}
      </div>

      {description && (
        <div className="utrecht-form-field__description">
          <HelpText id={descriptionId}>{description}</HelpText>
        </div>
      )}

      <FAQItems items={faqItems} />
    </FormField>
  );
};

Checkbox.displayName = 'Checkbox';

export default Checkbox;
