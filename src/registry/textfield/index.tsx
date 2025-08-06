import type {TextFieldComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioTextFieldProps {
  componentDefinition: TextFieldComponentSchema;
}

export const FormioTextField: React.FC<FormioTextFieldProps> = ({
  componentDefinition: {key, label, description, tooltip, placeholder, validate},
}) => {
  return (
    <TextField
      name={key}
      label={label}
      tooltip={tooltip}
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
  isEmpty,
};

export default TextFieldComponent;
