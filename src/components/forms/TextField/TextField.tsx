import {Paragraph, Textbox, FormField as UtrechtFormField} from '@utrecht/component-library-react';
import {useField} from 'formik';
import React from 'react';

import {HelpText, Label, ValidationErrors, Wrapper} from '@/components/utils';
import useIsInvalid from '@/hooks/useIsInvalid';

export interface TextFieldProps {
  name: string;
  label?: React.ReactNode;
  isRequired?: boolean;
  description?: string;
  disabled?: boolean;
}

export interface TextFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: 'text';
}

export const TextField: React.FC<TextFieldProps & TextFieldInputProps> = ({
  name,
  label = '',
  isRequired = false,
  description = '',
  disabled = false,
  ...inputProps
}) => {
  const id = React.useId();
  const [field] = useField<string>({name, ...inputProps});
  const invalid = useIsInvalid(name);
  return (
    <Wrapper>
      <UtrechtFormField type="text" invalid={invalid} className="utrecht-form-field--openforms">
        <Label id={id} isRequired={isRequired} disabled={disabled}>
          {label}
        </Label>
        <Paragraph>
          <Textbox
            {...field}
            id={id}
            className="utrecht-textbox--openforms"
            disabled={disabled}
            invalid={invalid}
            {...inputProps}
          />
        </Paragraph>
        <HelpText>{description}</HelpText>
        <ValidationErrors name={name} />
      </UtrechtFormField>
    </Wrapper>
  );
};

export default TextField;
