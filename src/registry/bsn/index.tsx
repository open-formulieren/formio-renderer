import type {BsnComponentSchema} from '@open-formulieren/types';

import TextField from '@/components/forms/TextField';
import type {RegistryEntry} from '@/registry/types';

import getInitialValues from './initialValues';
import getValidationSchema from './validationSchema';

export interface FormioBSNProps {
  componentDefinition: BsnComponentSchema;
}

export const FormioBSN: React.FC<FormioBSNProps> = ({
  componentDefinition: {key, label, description, validate},
}) => {
  return (
    <TextField
      name={key}
      type="text"
      label={label}
      description={description}
      isRequired={validate?.required}
      pattern="[0-9]{9}"
      inputMode="numeric"
      placeholder="XXXXXXXXX"
    />
  );
};

const EmailComponent: RegistryEntry<BsnComponentSchema> = {
  formField: FormioBSN,
  getInitialValues,
  getValidationSchema,
};

export default EmailComponent;
