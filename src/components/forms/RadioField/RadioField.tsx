import {Fieldset, FieldsetLegend} from '@utrecht/component-library-react';
import {LabelContent} from 'components/forms/Label';
import {useField} from 'formik';
import {useId} from 'react';

import HelpText from '@/components/forms/HelpText';
import ValidationErrors from '@/components/forms/ValidationErrors';

import './RadioField.scss';
import RadioOption from './RadioOption';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
}

export interface RadioFieldProps {
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
   * Array of possible choices for the field. Only one can be selected.
   */
  options: RadioOption[];
}

/**
 * A radio field with a set of options.
 *
 * @reference https://nl-design-system.github.io/utrecht/storybook-react/?path=/docs/react-component-form-field-radio-group--docs
 */
const RadioField: React.FC<RadioFieldProps> = ({
  name,
  label = '',
  isRequired = false,
  description = '',
  isDisabled = false,
  options = [],
}) => {
  const [, {error = '', touched}] = useField({name, type: 'radio'});
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;
  const descriptionid = `${id}-description`;

  return (
    <Fieldset
      className="utrecht-form-fieldset--openforms"
      disabled={isDisabled}
      invalid={invalid}
      role="radiogroup"
      aria-describedby={description ? descriptionid : undefined}
    >
      <FieldsetLegend>
        <LabelContent isDisabled={isDisabled} isRequired={isRequired}>
          {label}
        </LabelContent>
      </FieldsetLegend>

      {options.map(({value, label: optionLabel}, index) => (
        <RadioOption
          key={value}
          name={name}
          value={value}
          label={optionLabel}
          id={id}
          index={index}
          errorMessageId={errorMessageId}
          isDisabled={isDisabled}
        />
      ))}

      <HelpText id={descriptionid}>{description}</HelpText>
      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </Fieldset>
  );
};

RadioField.displayName = 'RadioField';

export default RadioField;
