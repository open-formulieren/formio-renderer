import {FormFieldDescription} from '@utrecht/component-library-react';
import {ErrorMessage} from 'formik';

export interface ValidationErrorsProps {
  name: string;
}

const ValidationErrors: React.FC<ValidationErrorsProps> = ({name}) => (
  <ErrorMessage name={name}>
    {/* TODO: when dealing with multiple error messages, we'll probably JSON (de)serialize them. */}
    {error => (
      <FormFieldDescription invalid className="utrecht-form-field-description--openforms-errors">
        {error}
      </FormFieldDescription>
    )}
  </ErrorMessage>
);

export default ValidationErrors;
