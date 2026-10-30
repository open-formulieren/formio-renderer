import {FormField} from '@utrecht/form-field-react';
import {FormLabel} from '@utrecht/form-label-react';
import {RadioButton} from '@utrecht/radio-button-react';
import {useField, useFormikContext} from 'formik';

export interface RadioOptionProps {
  name: string;
  value: string;
  label: React.ReactNode;
  description?: string;
  id: string;
  index: number;
  ['aria-describedby']?: string;
  isReadOnly?: boolean;
}

const RadioOption: React.FC<RadioOptionProps> = ({
  name,
  value,
  label,
  description,
  id,
  index,
  ['aria-describedby']: ariaDescribedBy,
  isReadOnly,
}) => {
  const {validateField} = useFormikContext();
  const [props, , {setTouched}] = useField({name, value, type: 'radio'});

  return (
    <FormField type="radio" className="utrecht-form-field--openforms">
      <RadioButton
        className="utrecht-form-field__input"
        id={`${id}-opt-${index}`}
        aria-describedby={ariaDescribedBy}
        aria-readonly={isReadOnly}
        {...props}
        onChange={async e => {
          // block form value changes if readonly - radio inputs don't support `readonly`
          // out of the box
          if (isReadOnly) return;
          props.onChange(e);

          // The radio component validation is now triggered on change. This is a
          // deliberate break from our normal validation trigger (on blur).
          // This is fine as long as we only support `required` validation on the radio
          // component. If any other validation is needed, we will require a different
          // solution.
          await setTouched(true);
          await validateField(name);
        }}
        value={value}
      />
      <FormLabel
        htmlFor={`${id}-opt-${index}`}
        disabled={isReadOnly}
        type="radio"
        className="utrecht-form-label--openforms"
      >
        {label}
      </FormLabel>
      {description && (
        <div className="utrecht-form-field-description utrecht-form-field__description">
          {description}
        </div>
      )}
    </FormField>
  );
};

RadioOption.displayName = 'RadioOption';

export default RadioOption;
