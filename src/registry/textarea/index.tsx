import type {TextareaComponentSchema} from '@open-formulieren/types';

import Textarea from '@/components/forms/Textarea';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioTextareaProps {
  componentDefinition: TextareaComponentSchema;
}

export const FormioTextarea: React.FC<FormioTextareaProps> = ({
  componentDefinition: {key, label, description, tooltip, placeholder, validate},
}) => {
  return (
    <Textarea
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      placeholder={placeholder}
    />
  );
};

const TextareaComponent: RegistryEntry<TextareaComponentSchema> = {
  formField: FormioTextarea,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
};

export default TextareaComponent;
