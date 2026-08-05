import {FormFieldErrorMessage} from '@utrecht/form-field-error-message-react';

import './ValidationErrors.scss';

export interface ValidationErrorsProps {
  id: string;
  error: string;
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({error = '', id}) => {
  if (!error) return null;
  return (
    <FormFieldErrorMessage id={id} className="utrecht-form-field-error-message--openforms-errors">
      {error}
    </FormFieldErrorMessage>
  );
};

ValidationErrors.displayName = 'ValidationErrors';

export default ValidationErrors;
