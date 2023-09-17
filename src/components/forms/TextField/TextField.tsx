import {Paragraph, Textbox, FormField as UtrechtFormField} from '@utrecht/component-library-react';
import {TextboxTypes} from '@utrecht/component-library-react/dist/Textbox';
import {useField} from 'formik';
import React, {useRef} from 'react';

import {CharCount, HelpText, Label, ValidationErrors, Wrapper} from '@/components/utils';
import useIsInvalid from '@/hooks/useIsInvalid';

export interface TextFieldProps {
  name: string;
  label?: React.ReactNode;
  isRequired?: boolean;
  description?: string;
  disabled?: boolean;
  tooltip?: string;
  showCharCount?: boolean;
}

export interface TextFieldInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type?: TextboxTypes;
}

export const TextField: React.FC<TextFieldProps & TextFieldInputProps> = ({
  name,
  type = 'text',
  label = '',
  isRequired = false,
  description = '',
  disabled = false,
  tooltip = '',
  showCharCount = false,
  ...inputProps
}) => {
  const id = React.useId();
  const [field, meta] = useField<string>({name, type, ...inputProps});
  const invalid = useIsInvalid(name);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasFocus = inputRef.current === document.activeElement;
  const {touched} = meta;
  const {value} = field;
  const charCount = showCharCount && (touched || hasFocus) && value && <CharCount value={value} />;

  return (
    <Wrapper>
      <UtrechtFormField type={type} invalid={invalid} className="utrecht-form-field--openforms">
        <Label id={id} isRequired={isRequired} disabled={disabled}>
          {label}
        </Label>
        <Paragraph>
          <Textbox
            ref={inputRef}
            type={type}
            {...field}
            id={id}
            className="utrecht-textbox--openforms"
            disabled={disabled}
            invalid={invalid}
            {...inputProps}
          />
          {charCount}
        </Paragraph>
        <HelpText>{description}</HelpText>
        <ValidationErrors name={name} />
      </UtrechtFormField>
    </Wrapper>
  );
};

export default TextField;
