import type {EmailComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';

export interface FormioEmailProps {
  componentDefinition: EmailComponentSchema;
}

const FormioEmail: React.FC<FormioEmailProps> = ({
  componentDefinition: {key, label, description, placeholder, validate, autocomplete},
}) => {
  return (
    <TextField
      name={key}
      type="email"
      label={label}
      description={description}
      isRequired={validate?.required}
      placeholder={placeholder}
      autoComplete={autocomplete}
    />
  );
};

export default FormioEmail;
export {default as getInitialValues} from './initialValues';
export {default as getValidationSchema} from './validationSchema';
