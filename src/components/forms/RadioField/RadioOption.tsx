import {FormField, FormLabel, RadioButton} from '@utrecht/component-library-react';
import {useField, useFormikContext} from 'formik';

export interface RadioOptionProps {
  name: string;
  value: string;
  label: React.ReactNode;
  id: string;
  index: number;
  ['aria-describedby']?: string;
  isDisabled?: boolean;
}

const RadioOption: React.FC<RadioOptionProps> = ({
  name,
  value,
  label,
  id,
  index,
  ['aria-describedby']: ariaDescribedBy,
  isDisabled,
}) => {
  const {validateField} = useFormikContext();
  const [props] = useField({name, value, type: 'radio'});

  return (
    <FormField type="radio" className="utrecht-form-field--openforms">
      <RadioButton
        className="utrecht-form-field__input"
        id={`${id}-opt-${index}`}
        aria-describedby={ariaDescribedBy}
        {...props}
        onBlur={async e => {
          props.onBlur(e);
          await validateField(name);
        }}
        value={value}
      />
      <div className="utrecht-form-field__label utrecht-form-field__label--radio">
        <FormLabel
          htmlFor={`${id}-opt-${index}`}
          disabled={isDisabled}
          type="radio"
          className="utrecht-form-label--openforms"
        >
          {label}
        </FormLabel>
      </div>
    </FormField>
  );
};

RadioOption.displayName = 'RadioOption';

export default RadioOption;
