import type {TextFieldComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';

export interface FormioTextFieldProps {
  componentDefinition: TextFieldComponentSchema;
}

const FormioTextField: React.FC<FormioTextFieldProps> = ({
  componentDefinition: {key, label, description, placeholder, validate},
}) => {
  return (
    <TextField
      name={key}
      label={label}
      description={description}
      isRequired={validate?.required}
      placeholder={placeholder}
    />
  );
};

export default FormioTextField;
export {default as getInitialValues} from './initialValues';
