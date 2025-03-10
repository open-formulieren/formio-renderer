import {FormField, FormLabel, Paragraph, RadioButton} from '@utrecht/component-library-react';
import {useField, useFormikContext} from 'formik';

export interface RadioOptionProps {
  name: string;
  value: string;
  label: React.ReactNode;
  id: string;
  index: number;
  errorMessageId?: string;
  isDisabled?: boolean;
}

const RadioOption: React.FC<RadioOptionProps> = ({
  name,
  value,
  label,
  id,
  index,
  errorMessageId,
  isDisabled,
}) => {
  const {validateField} = useFormikContext();
  const [props] = useField({name, value, type: 'radio'});

  return (
    <FormField type="radio" className="utrecht-form-field--openforms">
      <RadioButton
        className="utrecht-form-field__input"
        id={`${id}-opt-${index}`}
        aria-describedby={errorMessageId}
        {...props}
        onBlur={async e => {
          props.onBlur(e);
          await validateField(name);
        }}
        value={value}
      />
      <Paragraph className="utrecht-form-field__label utrecht-form-field__label--radio">
        <FormLabel
          htmlFor={`${id}-opt-${index}`}
          disabled={isDisabled}
          type="radio"
          className="utrecht-form-label--openforms"
        >
          {label}
        </FormLabel>
      </Paragraph>
    </FormField>
  );
};

RadioOption.displayName = 'RadioOption';

export default RadioOption;
