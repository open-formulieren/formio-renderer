import type {IbanComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import ValueDisplay from './ValueDisplay';
import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioIBANProps {
  componentDefinition: IbanComponentSchema;
}

export const FormioIBAN: React.FC<FormioIBANProps> = ({
  componentDefinition: {key, label, tooltip, description, validate},
}) => {
  return (
    <TextField
      name={key}
      type="text"
      label={label}
      tooltip={tooltip}
      description={description}
      isRequired={validate?.required}
      inputMode="text"
      placeholder=""
    />
  );
};

const IBANComponent: RegistryEntry<IbanComponentSchema> = {
  formField: FormioIBAN,
  valueDisplay: ValueDisplay,
  getInitialValues,
  getValidationSchema,
};

export default IBANComponent;
