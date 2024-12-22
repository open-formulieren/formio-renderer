import {FormFieldDescription} from '@utrecht/component-library-react';

export interface ValidationErrorsProps {
  id: string;
  error: string;
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({error = '', id}) => {
  if (!error) return null;
  return (
    <FormFieldDescription
      id={id}
      invalid
      className="utrecht-form-field-description--openforms-errors"
    >
      {error}
    </FormFieldDescription>
  );
};

export default ValidationErrors;
