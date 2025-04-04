import {FormFieldDescription} from '@utrecht/component-library-react';

import './ValidationErrors.scss';

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

ValidationErrors.displayName = 'ValidationErrors';

export default ValidationErrors;
