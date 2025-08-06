import type {TextareaComponentSchema} from '@open-formulieren/types';

import Textarea from '@/components/forms/Textarea';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import isEmpty from './empty';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioTextareaProps {
  componentDefinition: TextareaComponentSchema;
}

export const FormioTextarea: React.FC<FormioTextareaProps> = ({
  componentDefinition: {
    key,
    label,
    description,
    tooltip,
    placeholder,
    validate,
    showCharCount,
    autocomplete,
    rows,
  },
}) => {
  return (
    <Textarea
      name={key}
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      placeholder={placeholder}
      showCharCount={showCharCount}
      maxLength={validate?.maxLength}
      autoComplete={autocomplete}
      rows={rows}
    />
  );
};

const TextareaComponent: RegistryEntry<TextareaComponentSchema> = {
  formField: FormioTextarea,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
  isEmpty,
};

export default TextareaComponent;
