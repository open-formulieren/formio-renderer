import type {EmailComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioEmailProps {
  componentDefinition: EmailComponentSchema;
}

export const FormioEmail: React.FC<FormioEmailProps> = ({
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

const EmailComponent: RegistryEntry<EmailComponentSchema> = {
  formField: FormioEmail,
  getInitialValues,
  getValidationSchema,
};

export default EmailComponent;
