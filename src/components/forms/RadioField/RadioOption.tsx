import {FormField, FormLabel, RadioButton} from '@utrecht/component-library-react';
import {useField} from 'formik';

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
  const [props] = useField({name, value, type: 'radio'});

  return (
    <FormField type="radio" className="utrecht-form-field--openforms">
      <RadioButton
        className="utrecht-form-field__input"
        id={`${id}-opt-${index}`}
        aria-describedby={ariaDescribedBy}
        aria-readonly={isReadOnly}
        {...props}
        onChange={e => {
          // block form value changes if readonly - radio inputs don't support `readonly`
          // out of the box
          if (isReadOnly) return;
          props.onChange(e);
        }}
        value={value}
      />
      <div className="utrecht-form-field__label utrecht-form-field__label--radio">
        <FormLabel
          htmlFor={`${id}-opt-${index}`}
          disabled={isReadOnly}
          type="radio"
          className="utrecht-form-label--openforms"
        >
          {label}
        </FormLabel>
      </div>
      {description && <div className="utrecht-form-description--openforms">{description}</div>}
    </FormField>
  );
};

RadioOption.displayName = 'RadioOption';

export default RadioOption;
