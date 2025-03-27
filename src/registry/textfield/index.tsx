import type {TextFieldComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioTextFieldProps {
  componentDefinition: TextFieldComponentSchema;
}

export const FormioTextField: React.FC<FormioTextFieldProps> = ({
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

const TextFieldComponent: RegistryEntry<TextFieldComponentSchema> = {
  formField: FormioTextField,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
};

export default TextFieldComponent;
