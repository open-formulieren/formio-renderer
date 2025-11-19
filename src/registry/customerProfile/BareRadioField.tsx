import {Fieldset} from '@utrecht/component-library-react';
import {useField} from 'formik';
import {useId} from 'react';

import type {RadioOption} from '@/components/forms/RadioField/RadioField';
import RadioOptionComponent from '@/components/forms/RadioField/RadioOption';
import ValidationErrors from '@/components/forms/ValidationErrors';
import {useFieldConfig} from '@/hooks';

interface BareRadioFieldProps {
  name: string;
  options: RadioOption[];
}

const BareRadioField: React.FC<BareRadioFieldProps> = ({name, options}) => {
  name = useFieldConfig(name);
  const [, {error = '', touched}] = useField({name, type: 'radio'});
  const id = useId();

  const invalid = touched && !!error;
  const errorMessageId = invalid ? `${id}-error-message` : undefined;

  return (
    <Fieldset className="utrecht-form-fieldset--openforms" invalid={invalid} role="radiogroup">
      {options.map(({value, label: optionLabel}, index) => (
        <RadioOptionComponent
          key={value}
          name={name}
          value={value}
          label={optionLabel}
          id={id}
          index={index}
          aria-describedby={errorMessageId}
        />
      ))}

      {touched && errorMessageId && <ValidationErrors error={error} id={errorMessageId} />}
    </Fieldset>
  );
};

export default BareRadioField;
