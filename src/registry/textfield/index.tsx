import type {TextFieldComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';

export interface FormioTextFieldProps {
  componentDefinition: TextFieldComponentSchema;
}

const FormioTextField: React.FC<FormioTextFieldProps> = ({
  componentDefinition: {key, label, description, validate},
}) => {
  return (
    <TextField name={key} label={label} description={description} isRequired={validate?.required} />
  );
};

export default FormioTextField;
